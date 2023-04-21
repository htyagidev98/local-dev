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
    assert = require('assert'),
    redis = require('redis'),
    FCM = require('fcm-node'),
    pug = require('pug'),
    aes256 = require('aes256');

global.packageDiscountOn = [];

var paytm_config = require('../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../paytm/checksum');
var querystring = require('querystring');

var client = redis.createClient({ host: 'localhost', port: 6379 });

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});

const xAccessToken = require('../../middlewares/xAccessToken');
const fun = require('../../api/function');
const event = require('../../api/event');

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
const BookingTiming = require('../../models/bookingTiming');
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
const Service = require('../../models/service');
const Insurance = require('../../models/insurance');
const Diagnosis = require('../../models/diagnosis');
const Customization = require('../../models/customization');
const Collision = require('../../models/collision');
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
const ActivityLog = require('../../models/activityLog');
const TransactionLog = require('../../models/transactionLog');
const DriverVerification = require('../../models/driverVerification');
const Gallery = require('../../models/gallery');
const ProductGallery = require('../../models/productGallery');
const Detailing = require('../../models/detailing');
const ProductCategory = require('../../models/productCategory');
const Product = require('../../models/product');
const ProductBrand = require('../../models/productBrand');
const ProductModel = require('../../models/productModel');
const BusinessProduct = require('../../models/businessProduct');
const Cart = require('../../models/cart');
const Order = require('../../models/order');
const BusinessOrder = require('../../models/businessOrder');
const OrderLine = require('../../models/orderLine');
const OrderConvenience = require('../../models/orderConvenience');
const BusinessConvenience = require('../../models/businessConvenience');
const ProductOffer = require('../../models/productOffer');
const ProductFilter = require('../../models/productFilter');
const ProductKeyword = require('../../models/productKeyword');
const Tax = require('../../models/tax');
const Location = require('../../models/location');
const CarSell = require('../../models/carSell');

var secret = config.secret;

router.post('/new/', async function (req, res, next) {
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
                status: "Complete",
            };

            var name = req.body.name.substring(0, 3);
            var rand = Math.ceil((Math.random() * 100000) + 1);

            var email = req.body.name;

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
            req.body.socialite = "";
            req.body.optional_info = "";
            req.body.business_info = "";
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
                event.otpSms(user);

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
                        status: "Complete",
                        user: user
                    },
                });
            });
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Phone number already in use.",
                responseData: {},
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
        var checkPhone = await User.findOne({ contact_no: req.body.contact_no, 'account_info.type': req.body.type }).select('-password').exec();
        if (checkPhone) {
            if (checkPhone.account_info.status == "Complete") {
                var data = {
                    otp: Math.ceil(Math.random() * 90000) + 10000,
                };

                User.findOneAndUpdate({ _id: checkPhone._id }, { $set: data }, { new: true }, async function (err, doc) {
                    var user = await User.findOne({ _id: checkPhone._id }).exec();
                    event.otpSms(user);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "OTP sent",
                        responseData: {
                            status: user.account_info.status,
                            user: user
                        }
                    });
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
                var data = {
                    otp: Math.ceil(Math.random() * 90000) + 10000,
                };

                User.findOneAndUpdate({ _id: checkUser._id }, { $set: data }, { new: true }, async function (err, doc) {
                    var user = await User.findOne({ _id: checkUser._id }).exec();
                    event.otpSms(user);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "OTP sent",
                        responseData: {
                            status: user.account_info.status,
                            user: user
                        }
                    });
                });
            }
            else if (checkUser.account_info.status == "Active") {
                const payload = {
                    user: checkUser['_id']
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
                    { '_id': checkUser._id, 'device.deviceType': deviceInfo.deviceType, 'device.deviceId': deviceInfo.deviceId },
                    {
                        "$pull": {
                            "device": { "deviceId": deviceInfo.deviceId }
                        }
                    }
                );

                User.findOneAndUpdate({ _id: checkUser._id }, {
                    $push: {
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
                });
            }
            else {
                var data = {
                    "account_info.status": "Complete",
                    otp: Math.ceil(Math.random() * 90000) + 10000,
                };

                User.findOneAndUpdate({ _id: checkUser._id }, { $set: data }, { new: true }, async function (err, doc) {
                    var user = await User.findOne({ _id: checkUser._id }).exec();
                    event.otpSms(user);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "OTP sent",
                        responseData: {
                            status: user.account_info.status,
                            user: user
                        }
                    });
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
    }
})

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

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        })
        /**/
    }
})

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

router.get('/clubs', xAccessToken.token, async function (req, res, next) {
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

router.post('/post/add', xAccessToken.token, async function (req, res, next) {
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
            PostMedia.findOneAndUpdate({ _id: req.body.media[m].id }, { $set: media }, { new: true }, function (err, doc) { });
        }

        for (var i = 0; i < tags.length; i++) {
            Hashtag.create({ post: post._id, hashtag: tags[i], created_at: new Date(), updated_at: new Date() }).then(async function (hashtag) { });
        }

        var point = {
            user: user,
            activity: "coin",
            tag: "post",
            points: 25,
            source: post._id,
            title: "",
            body: "",
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
    });
});

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

            Post.findOneAndUpdate({ _id: req.query.id, user: user }, { $set: { status: false } }, async function (err, doc) { });
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
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

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
});

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

router.delete('/comment/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;


    var count = await Comment.find({ user: user, _id: req.query.id }).count().exec();

    if (count == 1) {
        Comment.findOneAndUpdate({ _id: req.query.id, user: user }, { $set: { status: false } }, async function (err, doc) { });
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Deleted successfully",
            responseData: {}
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
                });
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
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            })
        }
    }
});

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
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            })
        }
    }
});

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
                .select('name username avatar avatar_address contact_no gender account_info created_at updated_at')
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

        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: clubInfo
        });
    }
});

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

        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: members
        });
    }
});

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


        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: media
        });
    }
});

router.get('/refer-earn', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = await User.findById(decoded.user).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: {
            owner: 1000,
            code: user.referral_code,
            user: 250,
            image: ["https://s3.ap-south-1.amazonaws.com/careager-staging/icon/car-refer-offer.jpg"],
        }
    });
});

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
        var bar = package.created_at;
        bar.setDate(bar.getDate() + package.validity);
        var e = bar;
        bar = moment.tz(bar, req.headers['tz'])

        var baz = bar.diff(serverTime);
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
                expired_at: moment(e).tz(req.headers['tz']).format('ll')
            });
        }
    });

    await UserPackage.find({ user: user, car: null }).cursor().eachAsync(async (package) => {
        var serverTime = moment.tz(new Date(), req.headers['tz']);
        var bar = package.created_at;
        bar.setDate(bar.getDate() + package.validity);
        var e = bar;
        bar = moment.tz(bar, req.headers['tz'])

        var baz = bar.diff(serverTime);
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
                expired_at: moment(e).tz(req.headers['tz']).format('ll')
            });
        }
    });


    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: packages
    });
});

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
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Unauthorized",
                    responseData: {}
                });
            }
        }
    }
});

router.get('/booking/category/get', xAccessToken.token, async function (req, res, next) {
    var data = [];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    if (req.query.car) {
        var car = await Car.findOne({ _id: req.query.car, user: user }).populate('model').exec();
        if (car) {
            var variant = await Variant.findOne({ _id: car.variant }).exec();
            if (variant) {
                return client.get('category-' + car._id, async (err, result) => {
                    if (result) {
                        const resultJSON = JSON.parse(result);
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "[c] Please hold on, we're about to update the database of discontinued cars.",
                            responseData: resultJSON,
                        });
                    }
                    else {
                        await BookingCategory.find({})
                            .sort({ position: 1 })
                            .cursor().eachAsync(async (d) => {

                                var enable = true;
                                /*if(d.tag=="services" && car.model.segment=="Small") 
                                {
                                    enable = false;
                                }
    
                                if(d.tag=="collision" && car.model.segment=="Small") 
                                {
                                    enable = false;
                                }
    
                                if(d.tag=="customization" && car.model.segment=="Small") 
                                {
                                    enable = false;
                                }
    
                                if(d.tag=="detailing" && car.model.segment=="Small") 
                                {
                                    enable = false;
                                }*/

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
                                    enable: enable,
                                    features: d.features
                                })
                            });

                        client.setex('category-' + car._id, 3600, JSON.stringify(data))

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "",
                            responseData: data
                        })
                    }
                });
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Something went wrong",
                    responseData: {}
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
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Something went wrong",
            responseData: {}
        });
    }
});

router.get('/booking/category/feature/get', xAccessToken.token, async function (req, res, next) {
    var variant = await Variant.findOne({ _id: car.variant }).exec();
    var carLength = parseInt(variant.specification.length);

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: await BookingCategory.find({ tag: req.query.tag }).exec()
    });
});

router.post('/booking/services/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: 'required',
    };

    var validation = new Validator(req.body, rules);

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

        if (!req.body.package) {
            req.body.package = null
        }

        var car = await Car.findOne({ _id: req.body.car, user: user }).populate('model').exec();
        if (car) {
            var business = req.body.business;
            if (req.body.type == "services") {
                await Service.find({ segment: car.model.segment, part_cost: 0, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        var labels = [];

                        labels.push(service.type)
                        labels.push(service.service)
                        var coupons = await Coupon.find({ label: { $in: labels }, expired_at: { "$gte": new Date() }, physical: false }).exec();

                        var gallery = service.gallery;
                        var getDiscount = {
                            package: req.body.package,
                            car: req.body.car,
                            category: service.type,
                            service: service.service,
                            tz: req.headers['tz'],
                            claim: false,
                        };

                        var package = await q.all(getPackageDiscount(getDiscount));
                        var labour_list = service.labour;
                        var labours = [];

                        var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount);

                        if (labour_list.length > 0) {
                            for (var l = 0; l < labour_list.length; l++) {
                                var quantity = 1;
                                if (labour_list[l].quantity) {
                                    quantity = labour_list[l].quantity;
                                }

                                var discount_total = 0;
                                var total = 0;
                                var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                var tax = [];
                                var rate = labour_list[l].rate;
                                var amount = parseFloat(labour_list[l].amount);
                                var tax_rate = tax_info.detail;
                                var base = amount;

                                if (Object.keys(package).length > 0) {
                                    if (package.discount_type == "percent") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = amount * (discount / 100);
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
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
                                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        base = base - discount_total;
                                    }
                                    total = total + amount;
                                }

                                var tax_details = {
                                    tax: tax_info.tax,
                                    rate: tax_info.rate,
                                    amount: total,
                                    detail: tax
                                }


                                labours.push({
                                    item: labour_list[l].item,
                                    source: labour_list[l].source,
                                    rate: parseFloat(labour_list[l].rate),
                                    quantity: 1,
                                    base: parseFloat(total.toFixed(2)),
                                    discount: parseFloat(discount_total.toFixed(2)),
                                    amount: total,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }

                        packages.push({
                            package: service.package,
                            service: service.service,
                            labour: labours,
                            labour_cost: _.sumBy(labours, x => x.amount),
                            parts: service.parts,
                            part_cost: Math.ceil(service.part_cost),
                            opening_fitting: service.opening_fitting,
                            of_cost: Math.ceil(service.of_cost),
                            exceeded_cost: 0,
                            mrp: _.sumBy(labours, x => x.amount) + (_.sumBy(labours, x => x.amount) * (40 / 100)),
                            cost: Math.ceil(service.part_cost) + _.sumBy(labours, x => x.amount) + service.of_cost,
                            discount: _.sumBy(labours, x => x.discount),
                            doorstep: service.doorstep,
                            unit: service.unit,
                            quantity: service.quantity,
                            part_cost_editable: service.part_cost_editable,
                            labour_cost_editable: service.labour_cost_editable,
                            of_cost_editable: service.of_cost_editable,
                            type: service.type,
                            source: service.id,
                            gallery: gallery.length,
                            description: service.description,
                            coupons: coupons,
                            id: service.id,
                            _id: service._id
                        });
                    });

                await Service.find({ model: car.model._id, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        var labels = [];

                        labels.push(service.type)
                        labels.push(service.service)
                        var coupons = await Coupon.find({ label: { $in: labels }, expired_at: { "$gte": new Date() }, physical: false }).exec();

                        var gallery = service.gallery;
                        var getDiscount = {
                            package: req.body.package,
                            car: req.body.car,
                            category: service.type,
                            service: service.service,
                            tz: req.headers['tz'],
                            claim: false,
                        };

                        var package = await q.all(getPackageDiscount(getDiscount));
                        var labour_list = service.labour;
                        var labours = [];

                        var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount);
                        if (labour_list.length > 0) {
                            for (var l = 0; l < labour_list.length; l++) {
                                var quantity = 1;
                                if (labour_list[l].quantity) {
                                    quantity = labour_list[l].quantity;
                                }

                                var discount_total = 0;
                                var total = 0;
                                var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                var tax = [];
                                var rate = labour_list[l].rate;
                                var amount = parseFloat(labour_list[l].amount);
                                var tax_rate = tax_info.detail;
                                var base = amount;

                                if (Object.keys(package).length > 0) {
                                    if (package.discount_type == "percent") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = amount * (discount / 100);
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
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
                                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        base = base - discount_total;
                                    }
                                    total = total + amount;
                                }

                                var tax_details = {
                                    tax: tax_info.tax,
                                    rate: tax_info.rate,
                                    amount: total,
                                    detail: tax
                                }


                                labours.push({
                                    item: labour_list[l].item,
                                    source: labour_list[l].source,
                                    rate: parseFloat(labour_list[l].rate),
                                    quantity: 1,
                                    base: parseFloat(total.toFixed(2)),
                                    discount: parseFloat(discount_total.toFixed(2)),
                                    amount: total,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }
                        packages.push({
                            package: service.package,
                            service: service.service,
                            labour: labours,
                            labour_cost: _.sumBy(labours, x => x.amount),
                            parts: service.parts,
                            part_cost: Math.ceil(service.part_cost),
                            opening_fitting: service.opening_fitting,
                            of_cost: Math.ceil(service.of_cost),
                            exceeded_cost: 0,
                            mrp: Math.ceil(service.part_cost) + _.sumBy(labours, x => x.amount) + (_.sumBy(labours, x => x.amount) * (40 / 100)),
                            cost: Math.ceil(service.part_cost) + _.sumBy(labours, x => x.amount) + service.of_cost,
                            discount: _.sumBy(labours, x => x.discount),
                            doorstep: service.doorstep,
                            unit: service.unit,
                            quantity: service.quantity,
                            part_cost_editable: service.part_cost_editable,
                            labour_cost_editable: service.labour_cost_editable,
                            of_cost_editable: service.of_cost_editable,
                            type: service.type,
                            source: service.id,
                            gallery: gallery.length,
                            description: service.description,
                            coupons: coupons,
                            id: service.id,
                            _id: service._id
                        });
                    });

                packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Please hold on, we're about to update the database of discontinued cars.",
                    responseData: packages
                });
            }

            if (req.body.type == "collision") {
                await Collision.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {

                        var labels = [];

                        labels.push(service.type)
                        labels.push(service.service)
                        var coupons = await Coupon.find({ label: { $in: labels }, expired_at: { "$gte": new Date() }, physical: false }).exec();

                        var getDiscount = {
                            package: req.body.package,
                            car: req.body.car,
                            category: service.type,
                            service: service.service,
                            tz: req.headers['tz'],
                            claim: false,
                        };

                        var package = await q.all(getPackageDiscount(getDiscount));
                        var labour_list = service.labour;
                        var labours = [];

                        var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount);
                        if (labour_list.length > 0) {
                            for (var l = 0; l < labour_list.length; l++) {
                                var quantity = 1;
                                if (labour_list[l].quantity) {
                                    quantity = labour_list[l].quantity;
                                }

                                var discount_total = 0;
                                var total = 0;
                                var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                var tax = [];
                                var rate = labour_list[l].rate;
                                var amount = parseFloat(labour_list[l].amount);
                                var tax_rate = tax_info.detail;
                                var base = amount;

                                if (Object.keys(package).length > 0) {
                                    if (package.discount_type == "percent") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = amount * (discount / 100);
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
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
                                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        base = base - discount_total;
                                    }
                                    total = total + amount;
                                }

                                var tax_details = {
                                    tax: tax_info.tax,
                                    rate: tax_info.rate,
                                    amount: total,
                                    detail: tax
                                }


                                labours.push({
                                    item: labour_list[l].item,
                                    source: labour_list[l].source,
                                    rate: parseFloat(labour_list[l].rate),
                                    quantity: 1,
                                    base: parseFloat(total.toFixed(2)),
                                    discount: parseFloat(discount_total.toFixed(2)),
                                    amount: total,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }
                        packages.push({
                            package: service.package,
                            service: service.service,
                            labour: labours,
                            labour_cost: _.sumBy(labours, x => x.amount),
                            parts: service.parts,
                            part_cost: Math.ceil(service.part_cost),
                            opening_fitting: service.opening_fitting,
                            of_cost: Math.ceil(service.of_cost),
                            exceeded_cost: 0,
                            mrp: _.sumBy(labours, x => x.amount) + (_.sumBy(labours, x => x.amount) * (40 / 100)),
                            cost: Math.ceil(service.part_cost) + _.sumBy(labours, x => x.amount) + service.of_cost,
                            discount: _.sumBy(labours, x => x.discount),
                            doorstep: service.doorstep,
                            unit: service.unit,
                            quantity: service.quantity,
                            part_cost_editable: service.part_cost_editable,
                            labour_cost_editable: service.labour_cost_editable,
                            of_cost_editable: service.of_cost_editable,
                            type: service.type,
                            source: service.id,
                            gallery: 0,
                            description: service.description,
                            coupons: coupons,
                            id: service.id,
                            _id: service._id
                        });
                    });

                packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Please hold on, we're about to update the database of discontinued cars.",
                    responseData: packages
                });
            }

            else if (req.body.type == "detailing") {
                await Detailing.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {

                        var labels = [];

                        labels.push(service.type)
                        labels.push(service.service)
                        var coupons = await Coupon.find({ label: { $in: labels }, expired_at: { "$gte": new Date() }, physical: false }).exec();

                        var gallery = service.gallery;
                        var getDiscount = {
                            package: req.body.package,
                            car: req.body.car,
                            category: service.type,
                            service: service.service,
                            tz: req.headers['tz'],
                            claim: false,
                        };

                        var package = await q.all(getPackageDiscount(getDiscount));
                        var labour_list = service.labour;
                        var labours = [];

                        var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount);
                        if (labour_list.length > 0) {
                            for (var l = 0; l < labour_list.length; l++) {
                                var quantity = 1;
                                if (labour_list[l].quantity) {
                                    quantity = labour_list[l].quantity;
                                }

                                var discount_total = 0;
                                var total = 0;
                                var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                var tax = [];
                                var rate = labour_list[l].rate;
                                var amount = parseFloat(labour_list[l].amount);
                                var tax_rate = tax_info.detail;
                                var base = amount;

                                if (Object.keys(package).length > 0) {
                                    if (package.discount_type == "percent") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = amount * (discount / 100);
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
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
                                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        base = base - discount_total;
                                    }
                                    total = total + amount;
                                }

                                var tax_details = {
                                    tax: tax_info.tax,
                                    rate: tax_info.rate,
                                    amount: total,
                                    detail: tax
                                }


                                labours.push({
                                    item: labour_list[l].item,
                                    source: labour_list[l].source,
                                    rate: parseFloat(labour_list[l].rate),
                                    quantity: 1,
                                    base: parseFloat(total.toFixed(2)),
                                    discount: parseFloat(discount_total.toFixed(2)),
                                    amount: total,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }

                        packages.push({
                            package: service.package,
                            service: service.service,
                            labour: labours,
                            labour_cost: _.sumBy(labours, x => x.amount),
                            parts: service.parts,
                            part_cost: Math.ceil(service.part_cost),
                            opening_fitting: service.opening_fitting,
                            of_cost: Math.ceil(service.of_cost),
                            exceeded_cost: 0,
                            mrp: _.sumBy(labours, x => x.amount) + (_.sumBy(labours, x => x.amount) * (40 / 100)),
                            cost: Math.ceil(service.part_cost) + _.sumBy(labours, x => x.amount) + service.of_cost,
                            discount: _.sumBy(labours, x => x.discount),
                            doorstep: service.doorstep,
                            unit: service.unit,
                            quantity: service.quantity,
                            part_cost_editable: service.part_cost_editable,
                            labour_cost_editable: service.labour_cost_editable,
                            of_cost_editable: service.of_cost_editable,
                            type: service.type,
                            source: service.id,
                            gallery: gallery.length,
                            description: service.description,
                            coupons: coupons,
                            id: service.id,
                            _id: service._id
                        });
                    });

                packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Please hold on, we're about to update the database of discontinued cars.",
                    responseData: packages
                });
            }

            else if (req.body.type == "customization") {

                await Customization.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {

                        var labels = [];

                        labels.push(service.type)
                        labels.push(service.service)
                        var coupons = await Coupon.find({ label: { $in: labels }, expired_at: { "$gte": new Date() }, physical: false }).exec();

                        var getDiscount = {
                            package: req.body.package,
                            car: req.body.car,
                            category: service.type,
                            service: service.service,
                            tz: req.headers['tz'],
                            claim: false,
                        };

                        var package = await q.all(getPackageDiscount(getDiscount));
                        var labour_list = service.labour;
                        var labours = [];

                        var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount);
                        if (labour_list.length > 0) {
                            for (var l = 0; l < labour_list.length; l++) {
                                var quantity = 1;
                                if (labour_list[l].quantity) {
                                    quantity = labour_list[l].quantity;
                                }

                                var discount_total = 0;
                                var total = 0;
                                var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                var tax = [];
                                var rate = labour_list[l].rate;
                                var amount = parseFloat(labour_list[l].amount);
                                var tax_rate = tax_info.detail;
                                var base = amount;

                                if (Object.keys(package).length > 0) {
                                    if (package.discount_type == "percent") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = amount * (discount / 100);
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
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
                                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        base = base - discount_total;
                                    }
                                    total = total + amount;
                                }

                                var tax_details = {
                                    tax: tax_info.tax,
                                    rate: tax_info.rate,
                                    amount: total,
                                    detail: tax
                                }


                                labours.push({
                                    item: labour_list[l].item,
                                    source: labour_list[l].source,
                                    rate: parseFloat(labour_list[l].rate),
                                    quantity: 1,
                                    base: parseFloat(total.toFixed(2)),
                                    discount: parseFloat(discount_total.toFixed(2)),
                                    amount: total,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }
                        packages.push({
                            package: service.package,
                            service: service.service,
                            labour: labours,
                            labour_cost: _.sumBy(labours, x => x.amount),
                            parts: service.parts,
                            part_cost: Math.ceil(service.part_cost),
                            opening_fitting: service.opening_fitting,
                            of_cost: Math.ceil(service.of_cost),
                            exceeded_cost: 0,
                            mrp: Math.ceil(service.mrp),
                            cost: Math.ceil(service.part_cost) + _.sumBy(labours, x => x.amount) + service.of_cost,
                            discount: _.sumBy(labours, x => x.discount),
                            doorstep: service.doorstep,
                            unit: service.unit,
                            quantity: service.quantity,
                            part_cost_editable: service.part_cost_editable,
                            labour_cost_editable: service.labour_cost_editable,
                            of_cost_editable: service.of_cost_editable,
                            type: service.type,
                            source: service.id,
                            gallery: 0,
                            description: service.description,
                            coupons: coupons,
                            id: service.id,
                            _id: service._id
                        });
                    });

                packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Please hold on, we're about to update the database of discontinued cars.",
                    responseData: packages
                });

            }

            else if (req.body.type == "package") {
                await Package.find({ label: "special", business: business }).cursor().eachAsync(async (service) => {
                    var serverTime = moment.tz(new Date(), req.headers['tz']);

                    var bar = service.created_at;
                    bar.setDate(bar.getDate() + service.validity);

                    var e = bar;
                    bar = moment.tz(bar, req.headers['tz'])

                    var baz = bar.diff(serverTime);

                    var check = await UserPackage.find({ user: user, package: service._id, car: req.body.car }).count().exec();
                    if (check <= 0) {
                        if (baz > 0) {
                            if (service.category == "addOn") {
                                packages.push({
                                    service: service.name,
                                    mrp: 0,
                                    discount: service.discount,
                                    labour_cost: 0,
                                    part_cost: service.cost,
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
                                    labour_cost: 0,
                                    part_cost: service.cost,
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
        if (req.body.package == "") {
            req.body.package = null;
        }

        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var total = 0;
        var labourCost = 0;
        var part_cost = 0;
        var is_services = true;
        var doorstep = true;
        var bookingService = [];


        var services = req.body.services;
        var countBooking = await Booking.find({}).count().exec();
        var checkCar = await Car.findOne({ '_id': req.body.car, user: user }).exec();

        var advisorBooking = [];
        await Management.find({ business: req.body.business, role: "Service Advisor" })
            .cursor().eachAsync(async (a) => {
                var d = await Booking.find({ business: req.body.business, advisor: a.user }).count().exec();
                advisorBooking.push({
                    user: a.user,
                    count: await Booking.find({ business: req.body.business, advisor: a.user }).count().exec()
                })
            });

        if (advisorBooking.length != 0) {
            var min = advisorBooking.reduce(function (prev, current) {
                return (prev.count < current.count) ? prev : current
            });
            var advisor = min.user
        }
        else {
            var advisor = req.body.business
        }

        var customer_requirements = [];
        if (req.body.requirements) {
            customer_requirements.push({
                user: user,
                requirement: req.body.requirements,
            });
        }


        if (checkCar) {
            if (req.body.is_services == false) {
                var baz = 1
            }
            else {
                var checkBooking = await Booking.findOne({ car: checkCar._id, date: new Date(req.body.date).toISOString(), status: { $in: ["Confirmed", "Pending", "Approval", "Approved", "Failed", "JobInitiated"] }, is_services: true }).exec();


                if (checkBooking) {
                    var serverTime = moment.tz(new Date(req.body.date).toISOString(), req.headers['tz']);
                    var bar = moment(checkBooking.date).tz(req.headers['tz']).format('YYYY-MM-DD');
                    bar = moment.tz(new Date(bar).toISOString(), req.headers['tz']);
                    var baz = bar.diff(serverTime);
                }
                else {
                    var baz = 1
                }
            }

            if (baz > 0) {
                var checkVendor = await User.findOne({ '_id': req.body.business }).exec();
                if (checkVendor) {
                    for (var i = 0; i < services.length; i++) {
                        if (services[i].type == "package") {
                            await Package.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                                if (service) {
                                    var tax_info = await Tax.findOne({ tax: "18.0% GST" }).exec();
                                    var tax_rate = tax_info.detail;
                                    var amount = service.cost;
                                    var base = amount;
                                    var labour_tax = [];
                                    var labours = [];

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
                                                })
                                            }
                                            else {
                                                base = base - t
                                                labour_tax.push({
                                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                                    rate: parseFloat(tax_info.rate.toFixed(2)),
                                                    amount: parseFloat(tax_on_amount.toFixed(2))
                                                })
                                            }
                                        }
                                    }

                                    labours.push({
                                        item: service.name,
                                        quantity: 1,
                                        rate: parseFloat(service.cost),
                                        base: parseFloat(base.toFixed(2)),
                                        amount: parseFloat(amount),
                                        discount: 0,
                                        customer_dep: 100,
                                        insurance_dep: 0,
                                        amount_is_tax: "inclusive",
                                        tax_amount: _.sumBy(labour_tax, x => x.amount),
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        tax_info: {
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            base: parseFloat(base.toFixed(2)),
                                            detail: labour_tax
                                        }
                                    })

                                    is_services = false;

                                    bookingService.push({
                                        source: services[i].id,
                                        service: service.name,
                                        description: service.description,
                                        cost: Math.ceil(service.cost),
                                        labour_cost: Math.ceil(service.cost),
                                        part_cost: 0,
                                        of_cost: 0,
                                        discount: 0,
                                        parts: [],
                                        labour: labours,
                                        opening_fitting: [],
                                        type: "package",
                                        customer_approval: true, surveyor_approval: false,
                                    });

                                    // console.log(bookingService)

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
                        else if (services[i].type == "addOn") {
                            await Package.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                                if (service) {
                                    var tax_info = await Tax.findOne({ tax: "18.0% GST" }).exec();
                                    var tax_rate = tax_info.detail;
                                    var amount = service.cost;
                                    var base = amount;
                                    var labour_tax = [];
                                    var labours = [];

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
                                                })
                                            }
                                            else {
                                                base = base - t
                                                labour_tax.push({
                                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                                    rate: parseFloat(tax_info.rate.toFixed(2)),
                                                    amount: parseFloat(tax_on_amount.toFixed(2))
                                                })
                                            }
                                        }
                                    }

                                    labours.push({
                                        item: service.name,
                                        quantity: 1,
                                        rate: parseFloat(service.cost),
                                        base: parseFloat(base.toFixed(2)),
                                        amount: parseFloat(amount),
                                        discount: 0,
                                        customer_dep: 100,
                                        insurance_dep: 0,
                                        amount_is_tax: "inclusive",
                                        tax_amount: _.sumBy(labour_tax, x => x.amount),
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        tax_info: {
                                            tax: tax_info.tax, tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            base: parseFloat(base.toFixed(2)),
                                            detail: labour_tax
                                        }
                                    })

                                    is_services = true;

                                    bookingService.push({
                                        source: service._id,
                                        service: service.name,
                                        description: service.description,
                                        cost: Math.ceil(service.cost),
                                        labour_cost: Math.ceil(service.cost),
                                        part_cost: 0,
                                        of_cost: 0,
                                        discount: 0,
                                        parts: [],
                                        labour: labours,
                                        opening_fitting: [],
                                        type: "addOn",
                                        customer_approval: true, surveyor_approval: false,
                                    });

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
                        else if (services[i].type == "services") {
                            is_services = true;
                            await Service.find({ _id: services[i].id, publish: true, })
                                .cursor().eachAsync(async (service) => {
                                    var getDiscount = {
                                        package: req.body.package,
                                        car: req.body.car,
                                        category: service.type,
                                        service: service.service,
                                        tz: req.headers['tz'],
                                        claim: false,
                                    };

                                    if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                                        var quantity = 1
                                    }
                                    else {
                                        var quantity = parseInt(services[i].quantity)
                                    }

                                    var package = await q.all(getPackageDiscount(getDiscount));
                                    var labour_list = service.labour;
                                    var labours = [];

                                    var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount * quantity);
                                    if (labour_list.length > 0) {
                                        for (var l = 0; l < labour_list.length; l++) {
                                            var discount_total = 0;
                                            var total = 0;
                                            var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                            var tax = [];
                                            var rate = labour_list[l].rate;
                                            var amount = parseFloat(labour_list[l].amount) * quantity;
                                            var tax_rate = tax_info.detail;
                                            var base = amount;

                                            if (Object.keys(package).length > 0) {
                                                if (package.discount_type == "percent") {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = amount * (discount / 100);
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                else if (package.discount_type == "fixed") {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = parseFloat(discount_total.toFixed(2))
                                                        discount = amount - discount_total;
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                else {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
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
                                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                                rate: tax_info.rate,
                                                                amount: parseFloat(t.toFixed(2))
                                                            });
                                                        }
                                                    }

                                                    base = base - discount_total;
                                                }
                                                total = total + amount;
                                            }

                                            var tax_details = {
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: total,
                                                detail: tax
                                            }


                                            labours.push({
                                                item: labour_list[l].item,
                                                source: labour_list[l].source,
                                                rate: parseFloat(labour_list[l].rate),
                                                quantity: quantity,
                                                base: parseFloat(total.toFixed(2)),
                                                discount: parseFloat(discount_total.toFixed(2)),
                                                amount: total,
                                                customer_dep: parseFloat(labour_list[l].customer_dep),
                                                insurance_dep: parseFloat(labour_list[l].insurance_dep),
                                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                                amount_is_tax: labour_list[l].amount_is_tax,
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                tax_info: tax_details
                                            });
                                        }
                                    }

                                    bookingService.push({
                                        service: service.service,
                                        labour: labours,
                                        labour_cost: _.sumBy(labours, x => x.amount),
                                        discount: _.sumBy(labours, x => x.discount),
                                        parts: service.parts,
                                        part_cost: Math.ceil(service.part_cost),
                                        opening_fitting: service.opening_fitting,
                                        of_cost: Math.ceil(service.of_cost),
                                        exceeded_cost: 0,
                                        mrp: Math.ceil(service.mrp),
                                        cost: service.part_cost + _.sumBy(labours, x => x.amount) + service.of_cost,
                                        doorstep: service.doorstep,
                                        unit: service.unit,
                                        quantity: quantity,
                                        part_cost_editable: service.part_cost_editable,
                                        labour_cost_editable: service.labour_cost_editable,
                                        of_cost_editable: service.of_cost_editable,
                                        type: service.type,
                                        source: service.id,
                                        description: service.description,
                                        claim: false,
                                        customer_approval: true, surveyor_approval: false,
                                    });
                                });
                        }
                        else if (services[i].type == "collision") {
                            is_services = true;
                            await Collision.find({ _id: services[i].id, publish: true, })
                                .cursor().eachAsync(async (service) => {
                                    var getDiscount = {
                                        package: req.body.package,
                                        car: req.body.car,
                                        category: service.type,
                                        service: service.service,
                                        tz: req.headers['tz'],
                                        claim: false,
                                    };

                                    if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                                        var quantity = 1
                                    }
                                    else {
                                        var quantity = parseInt(services[i].quantity)
                                    }

                                    var package = await q.all(getPackageDiscount(getDiscount));
                                    var labour_list = service.labour;
                                    var labours = [];

                                    var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount * quantity);
                                    if (labour_list.length > 0) {
                                        for (var l = 0; l < labour_list.length; l++) {
                                            var discount_total = 0;
                                            var total = 0;
                                            var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                            var tax = [];
                                            var rate = labour_list[l].rate;
                                            var amount = parseFloat(labour_list[l].amount) * quantity;
                                            var tax_rate = tax_info.detail;
                                            var base = amount;

                                            if (Object.keys(package).length > 0) {
                                                if (package.discount_type == "percent") {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = amount * (discount / 100);
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                else if (package.discount_type == "fixed") {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = parseFloat(discount_total.toFixed(2))
                                                        discount = amount - discount_total;
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                else {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
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
                                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                                rate: tax_info.rate,
                                                                amount: parseFloat(t.toFixed(2))
                                                            });
                                                        }
                                                    }

                                                    base = base - discount_total;
                                                }
                                                total = total + amount;
                                            }

                                            var tax_details = {
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: total,
                                                detail: tax
                                            }


                                            labours.push({
                                                item: labour_list[l].item,
                                                source: labour_list[l].source,
                                                rate: parseFloat(labour_list[l].rate),
                                                quantity: quantity,
                                                base: parseFloat(total.toFixed(2)),
                                                discount: parseFloat(discount_total.toFixed(2)),
                                                amount: total,
                                                customer_dep: parseFloat(labour_list[l].customer_dep),
                                                insurance_dep: parseFloat(labour_list[l].insurance_dep),
                                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                                amount_is_tax: labour_list[l].amount_is_tax,
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                tax_info: tax_details
                                            });
                                        }
                                    }

                                    bookingService.push({
                                        service: service.service,
                                        labour: labours,
                                        labour_cost: _.sumBy(labours, x => x.amount),
                                        discount: _.sumBy(labours, x => x.discount),
                                        parts: service.parts,
                                        part_cost: Math.ceil(service.part_cost),
                                        opening_fitting: service.opening_fitting,
                                        of_cost: Math.ceil(service.of_cost),
                                        exceeded_cost: 0,
                                        mrp: Math.ceil(service.mrp),
                                        cost: service.part_cost + _.sumBy(labours, x => x.amount) + service.of_cost,
                                        doorstep: service.doorstep,
                                        unit: service.unit,
                                        quantity: quantity,
                                        part_cost_editable: service.part_cost_editable,
                                        labour_cost_editable: service.labour_cost_editable,
                                        of_cost_editable: service.of_cost_editable,
                                        type: service.type,
                                        source: service.id,
                                        description: service.description,
                                        claim: false,
                                        customer_approval: true, surveyor_approval: false,
                                    });
                                });
                        }
                        else if (services[i].type == "detailing") {
                            is_services = true;
                            await Detailing.find({ _id: services[i].id, publish: true, })
                                .cursor().eachAsync(async (service) => {
                                    var getDiscount = {
                                        package: req.body.package,
                                        car: req.body.car,
                                        category: service.type,
                                        service: service.service,
                                        tz: req.headers['tz'],
                                        claim: false,
                                    };

                                    if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                                        var quantity = 1
                                    }
                                    else {
                                        var quantity = parseInt(services[i].quantity)
                                    }

                                    var package = await q.all(getPackageDiscount(getDiscount));
                                    var labour_list = service.labour;
                                    var labours = [];

                                    var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount * quantity);
                                    if (labour_list.length > 0) {
                                        for (var l = 0; l < labour_list.length; l++) {
                                            var discount_total = 0;
                                            var total = 0;
                                            var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                            var tax = [];
                                            var rate = labour_list[l].rate;
                                            var amount = parseFloat(labour_list[l].amount) * quantity;
                                            var tax_rate = tax_info.detail;
                                            var base = amount;

                                            if (Object.keys(package).length > 0) {
                                                if (package.discount_type == "percent") {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = amount * (discount / 100);
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                else if (package.discount_type == "fixed") {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = parseFloat(discount_total.toFixed(2))
                                                        discount = amount - discount_total;
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                else {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
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
                                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                                rate: tax_info.rate,
                                                                amount: parseFloat(t.toFixed(2))
                                                            });
                                                        }
                                                    }

                                                    base = base - discount_total;
                                                }
                                                total = total + amount;
                                            }

                                            var tax_details = {
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: total,
                                                detail: tax
                                            }


                                            labours.push({
                                                item: labour_list[l].item,
                                                source: labour_list[l].source,
                                                rate: parseFloat(labour_list[l].rate),
                                                quantity: quantity,
                                                base: parseFloat(total.toFixed(2)),
                                                discount: parseFloat(discount_total.toFixed(2)),
                                                amount: total,
                                                customer_dep: parseFloat(labour_list[l].customer_dep),
                                                insurance_dep: parseFloat(labour_list[l].insurance_dep),
                                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                                amount_is_tax: labour_list[l].amount_is_tax,
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                tax_info: tax_details
                                            });
                                        }
                                    }

                                    bookingService.push({
                                        service: service.service,
                                        labour: labours,
                                        labour_cost: _.sumBy(labours, x => x.amount),
                                        discount: _.sumBy(labours, x => x.discount),
                                        parts: service.parts,
                                        part_cost: Math.ceil(service.part_cost),
                                        opening_fitting: service.opening_fitting,
                                        of_cost: Math.ceil(service.of_cost),
                                        exceeded_cost: 0,
                                        mrp: Math.ceil(service.mrp),
                                        cost: service.part_cost + _.sumBy(labours, x => x.amount) + service.of_cost,
                                        doorstep: service.doorstep,
                                        unit: service.unit,
                                        quantity: quantity,
                                        part_cost_editable: service.part_cost_editable,
                                        labour_cost_editable: service.labour_cost_editable,
                                        of_cost_editable: service.of_cost_editable,
                                        type: service.type,
                                        source: service.id,
                                        description: service.description,
                                        claim: false,
                                        customer_approval: true, surveyor_approval: false,
                                    });
                                });
                        }
                        else if (services[i].type == "customization") {
                            is_services = true;
                            await Customization.find({ _id: services[i].id, publish: true, })
                                .cursor().eachAsync(async (service) => {
                                    var getDiscount = {
                                        package: req.body.package,
                                        car: req.body.car,
                                        category: service.type,
                                        service: service.service,
                                        tz: req.headers['tz'],
                                        claim: false,
                                    };

                                    if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                                        var quantity = 1
                                    }
                                    else {
                                        var quantity = parseInt(services[i].quantity)
                                    }

                                    var package = await q.all(getPackageDiscount(getDiscount));
                                    var labour_list = service.labour;
                                    var labours = [];

                                    var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount * quantity);
                                    if (labour_list.length > 0) {
                                        for (var l = 0; l < labour_list.length; l++) {
                                            var discount_total = 0;
                                            var total = 0;
                                            var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                            var tax = [];
                                            var rate = labour_list[l].rate;
                                            var amount = parseFloat(labour_list[l].amount) * quantity;
                                            var tax_rate = tax_info.detail;
                                            var base = amount;

                                            if (Object.keys(package).length > 0) {
                                                if (package.discount_type == "percent") {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = amount * (discount / 100);
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                else if (package.discount_type == "fixed") {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = parseFloat(discount_total.toFixed(2))
                                                        discount = amount - discount_total;
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                else {
                                                    discount = parseFloat(package.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
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
                                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                                rate: tax_info.rate,
                                                                amount: parseFloat(t.toFixed(2))
                                                            });
                                                        }
                                                    }

                                                    base = base - discount_total;
                                                }
                                                total = total + amount;
                                            }

                                            var tax_details = {
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: total,
                                                detail: tax
                                            }


                                            labours.push({
                                                item: labour_list[l].item,
                                                source: labour_list[l].source,
                                                rate: parseFloat(labour_list[l].rate),
                                                quantity: quantity,
                                                base: parseFloat(total.toFixed(2)),
                                                discount: parseFloat(discount_total.toFixed(2)),
                                                amount: total,
                                                customer_dep: parseFloat(labour_list[l].customer_dep),
                                                insurance_dep: parseFloat(labour_list[l].insurance_dep),
                                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                                amount_is_tax: labour_list[l].amount_is_tax,
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                tax_info: tax_details
                                            });
                                        }
                                    }

                                    bookingService.push({
                                        service: service.service,
                                        labour: labours,
                                        labour_cost: _.sumBy(labours, x => x.amount),
                                        discount: _.sumBy(labours, x => x.discount),
                                        parts: service.parts,
                                        part_cost: Math.ceil(service.part_cost),
                                        opening_fitting: service.opening_fitting,
                                        of_cost: Math.ceil(service.of_cost),
                                        exceeded_cost: 0,
                                        mrp: Math.ceil(service.mrp),
                                        cost: service.part_cost + _.sumBy(labours, x => x.amount) + service.of_cost,
                                        doorstep: service.doorstep,
                                        unit: service.unit,
                                        quantity: quantity,
                                        part_cost_editable: service.part_cost_editable,
                                        labour_cost_editable: service.labour_cost_editable,
                                        of_cost_editable: service.of_cost_editable,
                                        type: service.type,
                                        source: service.id,
                                        description: service.description,
                                        claim: false,
                                        customer_approval: true, surveyor_approval: false,
                                    });
                                });
                        }
                    }

                    var labour_cost = _.sumBy(bookingService, x => x.labour_cost);
                    var part_cost = _.sumBy(bookingService, x => x.part_cost);
                    var of_cost = _.sumBy(bookingService, x => x.of_cost);
                    var discount_total = _.sumBy(bookingService, x => x.discount);
                    var pick_up_charges = 0;

                    if (req.body.convenience) {
                        if (req.body.convenience == "Pickup") {
                            var checkTotal = part_cost + labour_cost + of_cost;
                            if (checkVendor.business_info.pick_up_limit >= checkTotal) {
                                if (req.body.charges) {
                                    pick_up_charges = parseFloat(req.body.charges);
                                }
                            }
                        }
                        else {
                            if (req.body.charges) {
                                pick_up_charges = parseFloat(req.body.charges);
                            }
                        }
                    }

                    if (doorstep) {
                        var careager_cash = 0;
                        var paid_total = part_cost + labour_cost + of_cost + pick_up_charges - careager_cash;
                        var total = part_cost + labour_cost + of_cost + discount_total + pick_up_charges;

                        var payment = {
                            estimate_cost: paid_total,
                            careager_cash: careager_cash,
                            payment_mode: req.body.payment_mode,
                            payment_status: "Pending",
                            discount_type: "",
                            coupon: "",
                            coupon_type: "",
                            discount: discount_total.toFixed(2),
                            discount_total: discount_total.toFixed(2),
                            terms: checkVendor.business_info.terms,
                            pick_up_limit: checkVendor.business_info.pick_up_limit,
                            pick_up_charges: pick_up_charges,
                            part_cost: parseFloat(part_cost.toFixed(2)),
                            labour_cost: parseFloat(labour_cost.toFixed(2)),
                            of_cost: parseFloat(of_cost.toFixed(2)),
                            paid_total: 0,
                            total: parseFloat(total.toFixed(2)),
                            discount_applied: false,
                            transaction_id: "",
                            transaction_date: "",
                            transaction_status: "",
                            transaction_response: "",
                            policy_clause: 0,
                            salvage: 0,
                        };

                        var due = {
                            due: Math.ceil(paid_total.toFixed(2))
                        };

                        if (req.body.is_services == false) {
                            var date = new Date();
                        }
                        else {
                            if (req.body.date) {
                                var date = new Date(req.body.date).toISOString()
                            }
                            else {
                                var d = new Date();
                                var date = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 2);
                            }
                        }

                        var lastBooking = await Booking.findOne({ user: user, status: "Assigned", $or: [{ status: "Inactive" }] }).sort({ created_at: -1 }).exec();

                        if (lastBooking) {
                            var data = {
                                package: req.body.package,
                                car: req.body.car,
                                advisor: advisor,
                                business: req.body.business,
                                user: user,
                                services: bookingService,
                                booking_no: lastBooking.booking_no,
                                date: date,
                                customer_requirements: customer_requirements,
                                time_slot: req.body.time_slot,
                                convenience: req.body.convenience,
                                status: "Inactive",
                                payment: payment,
                                due: due,
                                address: req.body.address,
                                is_services: req.body.is_services,
                                created_at: new Date(),
                                updated_at: new Date()
                            };

                            Booking.findOneAndUpdate({ _id: lastBooking._id }, { $set: data }, { new: true }, async function (err, doc) {
                                if (!err) {
                                    var booking = await Booking.findById(lastBooking._id).exec();
                                    if (booking.is_services == true) {
                                        res.status(200).json({
                                            responseCode: 200,
                                            responseMessage: "Service Request has been booked",
                                            responseData: booking
                                        });
                                    }
                                    else {
                                        res.status(200).json({
                                            responseCode: 200,
                                            responseMessage: "Package successfully purchased, Book Services Now for added benefits",
                                            responseData: booking
                                        });
                                    }
                                }
                            });
                        }
                        else {
                            var data = {
                                package: req.body.package,
                                car: req.body.car,
                                advisor: advisor,
                                business: req.body.business,
                                user: user,
                                services: bookingService,
                                booking_no: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                                date: date,
                                time_slot: req.body.time_slot,
                                convenience: req.body.convenience,
                                status: "Inactive",
                                payment: payment,
                                due: due,
                                customer_requirements: customer_requirements,
                                address: req.body.address,
                                is_services: req.body.is_services,
                                created_at: new Date(),
                                updated_at: new Date()
                            };

                            Booking.create(data).then(async function (booking) {
                                if (booking.is_services == true) {
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Service Request has been booked",
                                        responseData: booking
                                    });
                                }
                                else {
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Package successfully purchased, Book Services Now for added benefits",
                                        responseData: booking
                                    });
                                }
                            });
                        }
                    }
                    else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Doorstep is not available for selected service",
                            responseData: {},
                        });
                    }
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
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Booking already exists for the same day. Please choose a different date or ask the advisor if anything needs to be added.",
                    responseData: {},
                });
            }
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

router.post('/booking/package/add/', xAccessToken.token, async function (req, res, next) {
    var rules = {
        package: 'required',
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
        var checkPackage = await UserPackage.findOne({ '_id': req.body.package, user: user }).exec();
        var car = await Car.findOne({ '_id': checkPackage.car, user: user }).populate('model').exec();
        var checkVendor = await User.findOne({ '_id': checkPackage.business }).exec();


        if (car && checkPackage) {
            var checkBooking = await Booking.findOne({ car: car._id, date: new Date(req.body.date).toISOString(), status: { $in: ["Confirmed", "Pending", "Approval", "Approved", "Failed", "JobInitiated"] }, is_services: true }).exec();

            if (checkBooking) {
                var serverTime = moment.tz(new Date(req.body.date).toISOString(), req.headers['tz']);
                var bar = moment(checkBooking.date).tz(req.headers['tz']).format('YYYY-MM-DD');
                bar = moment.tz(new Date(bar).toISOString(), req.headers['tz']);
                var baz = bar.diff(serverTime);
            }
            else {
                var baz = 1
            }


            if (baz > 0) {
                var advisorBooking = [];
                await Management.find({ business: checkPackage.business, role: "Service Advisor" })
                    .cursor().eachAsync(async (a) => {
                        var d = await Booking.find({ business: checkPackage.business, advisor: a.user }).count().exec();
                        advisorBooking.push({
                            user: a.user,
                            count: await Booking.find({ business: checkPackage.business, advisor: a.user }).count().exec()
                        })
                    });

                if (advisorBooking.length != 0) {
                    var min = advisorBooking.reduce(function (prev, current) {
                        return (prev.count < current.count) ? prev : current
                    });
                    var advisor = min.user
                }
                else {
                    var advisor = checkPackage.business
                }

                if (req.body.label == "Wheel Alignment" || req.body.label == "Wheel Balancing (cost per tyre, weights excluded)") {
                    var cond = { service: req.body.label, model: car.model, publish: true, };
                }
                else {
                    var cond = { service: req.body.label, model: car.model._id, publish: true, };
                }

                await Service.find(cond)
                    .cursor().eachAsync(async (service) => {
                        var getDiscount = {
                            package: checkPackage._id,
                            car: car._id,
                            category: service.type,
                            service: service.service,
                            tz: req.headers['tz'],
                            claim: false,
                        };

                        var package = await q.all(getPackageDiscount(getDiscount));
                        var labour_list = service.labour;
                        var labours = [];

                        var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount);
                        if (labour_list.length > 0) {
                            for (var l = 0; l < labour_list.length; l++) {
                                var quantity = 1;
                                if (labour_list[l].quantity) {
                                    quantity = labour_list[l].quantity;
                                }

                                var discount_total = 0;
                                var total = 0;
                                var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                var tax = [];
                                var rate = labour_list[l].rate;
                                var amount = parseFloat(labour_list[l].amount);
                                var tax_rate = tax_info.detail;
                                var base = amount;

                                if (Object.keys(package).length > 0) {
                                    if (package.discount_type == "percent") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = amount * (discount / 100);
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
                                    else {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = amount - parseFloat(discount_total.toFixed(2))
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    }
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
                                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        base = base - discount_total;
                                    }
                                    total = total + amount;
                                }

                                var tax_details = {
                                    tax: tax_info.tax,
                                    rate: tax_info.rate,
                                    amount: total,
                                    detail: tax
                                }


                                labours.push({
                                    item: labour_list[l].item,
                                    source: labour_list[l].source,
                                    rate: parseFloat(labour_list[l].rate),
                                    quantity: 1,
                                    base: parseFloat(total.toFixed(2)),
                                    discount: parseFloat(discount_total.toFixed(2)),
                                    amount: total,
                                    customer_dep: parseFloat(labour_list[l].customer_dep),
                                    insurance_dep: parseFloat(labour_list[l].insurance_dep),
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }
                        bookingService.push({
                            service: service.service,
                            labour: labours,
                            labour_cost: _.sumBy(labours, x => x.amount),
                            discount: _.sumBy(labours, x => x.discount),
                            parts: service.parts,
                            part_cost: Math.ceil(service.part_cost),
                            opening_fitting: service.opening_fitting,
                            of_cost: Math.ceil(service.of_cost),
                            exceeded_cost: 0,
                            mrp: Math.ceil(service.mrp),
                            cost: service.part_cost + _.sumBy(labours, x => x.amount) + service.of_cost,
                            doorstep: service.doorstep,
                            unit: service.unit,
                            quantity: service.quantity,
                            part_cost_editable: service.part_cost_editable,
                            labour_cost_editable: service.labour_cost_editable,
                            of_cost_editable: service.of_cost_editable,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            claim: false,
                            customer_approval: true, surveyor_approval: false,
                        });
                    });


                await Collision.find({ service: req.body.label, model: car.model._id }).cursor().eachAsync(async (service) => {
                    var getDiscount = {
                        package: checkPackage._id,
                        car: car._id,
                        category: service.type,
                        service: service.service,
                        tz: req.headers['tz'],
                        claim: false,
                    };

                    var package = await q.all(getPackageDiscount(getDiscount));
                    var labour_list = service.labour;
                    var labours = [];

                    var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount);
                    if (labour_list.length > 0) {
                        for (var l = 0; l < labour_list.length; l++) {
                            var quantity = 1;
                            if (labour_list[l].quantity) {
                                quantity = labour_list[l].quantity;
                            }

                            var discount_total = 0;
                            var total = 0;
                            var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                            var tax = [];
                            var rate = labour_list[l].rate;
                            var amount = parseFloat(labour_list[l].amount);
                            var tax_rate = tax_info.detail;
                            var base = amount;

                            if (Object.keys(package).length > 0) {
                                if (package.discount_type == "percent") {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = amount * (discount / 100);
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                }
                                else if (package.discount_type == "fixed") {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                        amount = parseFloat(discount_total.toFixed(2))
                                        discount = amount - discount_total;
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                }
                                else {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                }
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
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }

                                    base = base - discount_total;
                                }
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }


                            labours.push({
                                item: labour_list[l].item,
                                source: labour_list[l].source,
                                rate: parseFloat(labour_list[l].rate),
                                quantity: 1,
                                base: parseFloat(total.toFixed(2)),
                                discount: parseFloat(discount_total.toFixed(2)),
                                amount: total,
                                customer_dep: parseFloat(labour_list[l].customer_dep),
                                insurance_dep: parseFloat(labour_list[l].insurance_dep),
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount_is_tax: labour_list[l].amount_is_tax,
                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                tax_info: tax_details
                            });
                        }
                    }
                    bookingService.push({
                        service: service.service,
                        labour: labours,
                        labour_cost: _.sumBy(labours, x => x.amount),
                        discount: _.sumBy(labours, x => x.discount),
                        parts: service.parts,
                        part_cost: Math.ceil(service.part_cost),
                        opening_fitting: service.opening_fitting,
                        of_cost: Math.ceil(service.of_cost),
                        exceeded_cost: 0,
                        mrp: Math.ceil(service.mrp),
                        cost: service.part_cost + _.sumBy(labours, x => x.amount) + service.of_cost,
                        doorstep: service.doorstep,
                        unit: service.unit,
                        quantity: service.quantity,
                        part_cost_editable: service.part_cost_editable,
                        labour_cost_editable: service.labour_cost_editable,
                        of_cost_editable: service.of_cost_editable,
                        type: service.type,
                        source: service.id,
                        description: service.description,
                        claim: false,
                        customer_approval: true, surveyor_approval: false,
                    });
                });

                await Detailing.find({ service: req.body.label, segment: car.model.segment }).cursor().eachAsync(async (service) => {
                    var getDiscount = {
                        package: checkPackage._id,
                        car: car._id,
                        category: service.type,
                        service: service.service,
                        tz: req.headers['tz'],
                        claim: false,
                    };

                    var package = await q.all(getPackageDiscount(getDiscount));
                    var labour_list = service.labour;
                    var labours = [];

                    var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount);
                    if (labour_list.length > 0) {
                        for (var l = 0; l < labour_list.length; l++) {
                            var quantity = 1;
                            if (labour_list[l].quantity) {
                                quantity = labour_list[l].quantity;
                            }

                            var discount_total = 0;
                            var total = 0;
                            var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                            var tax = [];
                            var rate = labour_list[l].rate;
                            var amount = parseFloat(labour_list[l].amount);
                            var tax_rate = tax_info.detail;
                            var base = amount;

                            if (Object.keys(package).length > 0) {
                                if (package.discount_type == "percent") {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = amount * (discount / 100);
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                }
                                else if (package.discount_type == "fixed") {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                        amount = parseFloat(discount_total.toFixed(2))
                                        discount = amount - discount_total;
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                }
                                else {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                }
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
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }

                                    base = base - discount_total;
                                }
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }


                            labours.push({
                                item: labour_list[l].item,
                                source: labour_list[l].source,
                                rate: parseFloat(labour_list[l].rate),
                                quantity: 1,
                                base: parseFloat(total.toFixed(2)),
                                discount: parseFloat(discount_total.toFixed(2)),
                                amount: total,
                                customer_dep: parseFloat(labour_list[l].customer_dep),
                                insurance_dep: parseFloat(labour_list[l].insurance_dep),
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount_is_tax: labour_list[l].amount_is_tax,
                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                tax_info: tax_details
                            });
                        }
                    }
                    bookingService.push({
                        service: service.service,
                        labour: labours,
                        labour_cost: _.sumBy(labours, x => x.amount),
                        discount: _.sumBy(labours, x => x.discount),
                        parts: service.parts,
                        part_cost: Math.ceil(service.part_cost),
                        opening_fitting: service.opening_fitting,
                        of_cost: Math.ceil(service.of_cost),
                        exceeded_cost: 0,
                        mrp: Math.ceil(service.mrp),
                        cost: service.part_cost + _.sumBy(labours, x => x.amount) + service.of_cost,
                        doorstep: service.doorstep,
                        unit: service.unit,
                        quantity: service.quantity,
                        part_cost_editable: service.part_cost_editable,
                        labour_cost_editable: service.labour_cost_editable,
                        of_cost_editable: service.of_cost_editable,
                        type: service.type,
                        source: service.id,
                        description: service.description,
                        claim: false,
                        customer_approval: true, surveyor_approval: false,
                    });
                });

                await Customization.find({ service: req.body.label, model: car.model._id }).cursor().eachAsync(async (service) => {
                    var getDiscount = {
                        package: checkPackage._id,
                        car: car._id,
                        category: service.type,
                        service: service.service,
                        tz: req.headers['tz'],
                        claim: false,
                    };

                    var package = await q.all(getPackageDiscount(getDiscount));
                    var labour_list = service.labour;
                    var labours = [];

                    var discount_eligible_labour_cost = _.sumBy(labour_list, x => x.amount);
                    if (labour_list.length > 0) {
                        for (var l = 0; l < labour_list.length; l++) {
                            var quantity = 1;
                            if (labour_list[l].quantity) {
                                quantity = labour_list[l].quantity;
                            }

                            var discount_total = 0;
                            var total = 0;
                            var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                            var tax = [];
                            var rate = labour_list[l].rate;
                            var amount = parseFloat(labour_list[l].amount);
                            var tax_rate = tax_info.detail;
                            var base = amount;

                            if (Object.keys(package).length > 0) {
                                if (package.discount_type == "percent") {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = amount * (discount / 100);
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                }
                                else if (package.discount_type == "fixed") {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                        amount = parseFloat(discount_total.toFixed(2))
                                        discount = amount - discount_total;
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                }
                                else {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                }
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
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }

                                    base = base - discount_total;
                                }
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }


                            labours.push({
                                item: labour_list[l].item,
                                source: labour_list[l].source,
                                rate: parseFloat(labour_list[l].rate),
                                quantity: 1,
                                base: parseFloat(total.toFixed(2)),
                                discount: parseFloat(discount_total.toFixed(2)),
                                amount: total,
                                customer_dep: parseFloat(labour_list[l].customer_dep),
                                insurance_dep: parseFloat(labour_list[l].insurance_dep),
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount_is_tax: labour_list[l].amount_is_tax,
                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                tax_info: tax_details
                            });
                        }
                    }
                    bookingService.push({
                        service: service.service,
                        labour: labours,
                        labour_cost: _.sumBy(labours, x => x.amount),
                        discount: _.sumBy(labours, x => x.discount),
                        parts: service.parts,
                        part_cost: Math.ceil(service.part_cost),
                        opening_fitting: service.opening_fitting,
                        of_cost: Math.ceil(service.of_cost),
                        exceeded_cost: 0,
                        mrp: Math.ceil(service.mrp),
                        cost: service.part_cost + _.sumBy(labours, x => x.amount) + service.of_cost,
                        doorstep: service.doorstep,
                        unit: service.unit,
                        quantity: service.quantity,
                        part_cost_editable: service.part_cost_editable,
                        labour_cost_editable: service.labour_cost_editable,
                        of_cost_editable: service.of_cost_editable,
                        type: service.type,
                        source: service.id,
                        description: service.description,
                        claim: false,
                        customer_approval: true, surveyor_approval: false,
                    });
                });


                /*var pick_up_charges = 0;
                if(req.body.convenience){
                    if(req.body.convenience!="Self Drop")
                    {
                        var checkTotal = part_cost+labourCost;
                        if(checkTotal<=checkVendor.business_info.pick_up_limit)
                        {
                            pick_up_charges= Math.ceil(checkVendor.business_info.pick_up_charges);
                        }
                    }
                }*/

                var labour_cost = _.sumBy(bookingService, x => x.labour_cost);
                var part_cost = _.sumBy(bookingService, x => x.part_cost);
                var of_cost = _.sumBy(bookingService, x => x.of_cost);
                var discount_total = _.sumBy(bookingService, x => x.discount);
                var pick_up_charges = 0;
                if (req.body.charges) {
                    pick_up_charges = parseFloat(req.body.charges);
                }

                var careager_cash = 0;
                var paid_total = part_cost + labour_cost + of_cost + pick_up_charges - careager_cash;
                var total = part_cost + labour_cost + of_cost + discount_total;

                var payment = {
                    estimate_cost: paid_total,
                    careager_cash: careager_cash,
                    payment_mode: 'Online',
                    payment_status: "Pending",
                    discount_type: "",
                    coupon: "",
                    coupon_type: "",
                    discount: discount_total,
                    discount_total: discount_total,
                    terms: checkVendor.business_info.terms,
                    pick_up_limit: checkVendor.business_info.pick_up_limit,
                    pick_up_charges: pick_up_charges,
                    part_cost: parseFloat(part_cost.toFixed(2)),
                    labour_cost: parseFloat(labour_cost.toFixed(2)),
                    of_cost: parseFloat(of_cost.toFixed(2)),
                    paid_total: 0,
                    total: parseFloat(total.toFixed(2)),
                    discount_applied: false,
                    transaction_id: "",
                    transaction_date: "",
                    transaction_status: "",
                    transaction_response: "",
                    policy_clause: 0,
                    salvage: 0,
                };

                var due = {
                    due: parseFloat(paid_total.toFixed(2))
                }
                packageDiscountOn = [];

                var data = {
                    package: checkPackage._id,
                    car: checkPackage.car,
                    advisor: advisor,
                    business: checkPackage.business,
                    user: user,
                    services: bookingService,
                    booking_no: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                    date: new Date(req.body.date).toISOString(),
                    time_slot: req.body.time_slot,
                    convenience: req.body.convenience,
                    status: "Inactive",
                    payment: payment,
                    due: due,
                    customer_requirements: [],
                    address: req.body.address,
                    is_services: true,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                Booking.create(data).then(async function (booking) {
                    if (booking.is_services == true) {
                        event.zohoLead(booking._id)
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Service Request has been booked",
                            responseData: booking
                        });
                    }
                    else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Package successfully purchased, Book Services Now for added benefits",
                            responseData: booking
                        });
                    }
                });
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Booking already exists for the same day. Please choose a different date or ask the advisor if anything needs to be added.",
                    responseData: {},
                });
            }
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

router.post('/approved/services/add', xAccessToken.token, async function (req, res, next) {
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
        var bookingService = [];
        var loggedInDetails = await User.findById(decoded.user).exec();
        var logged_remark = "";
        var booking = await Booking.findOne({ _id: req.body.booking, user: user }).exec();
        if (booking) {
            var services = req.body.services;
            for (var i = 0; i < services.length; i++) {
                var parts_visible = true;
                var part_tax = [];
                var labour_tax = [];
                var fitting_tax = [];
                var tax_detail = {};
                if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                    var quantity = 1
                }
                else {
                    var quantity = parseInt(services[i].quantity)
                }

                var parts = services[i].parts;
                var part = [];
                if (parts.length > 0) {
                    part = services[i].parts
                    // console.log(services[i].parts)
                }
                else {
                    if (services[i].part_cost != 0) {
                        parts_visible = false;
                        var tax_info = await Tax.findOne({ tax: "0% GST" }).exec();
                        var tax_rate = tax_info.detail;
                        var service = services[i].service;
                        var amount = Math.ceil(services[i].part_cost) * quantity;
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
                            tax: tax_info.tax, tax_rate: tax_info.rate,
                            rate: tax_info.rate,
                            base: parseFloat(base.toFixed(2)),
                            detail: part_tax
                        }

                        part.push({
                            item: services[i].service,
                            hsn_sac: "",
                            part_no: "",
                            quantity: quantity,
                            rate: parseFloat(services[i].part_cost),
                            base: parseFloat(base.toFixed(2)),
                            amount: parseFloat(amount),
                            customer_dep: 100,
                            insurance_dep: 0,
                            tax_amount: _.sumBy(part_tax, x => x.amount),
                            amount_is_tax: "inclusive",
                            discount: 0,
                            tax: tax_info.tax, tax_rate: tax_info.rate,
                            tax_info: tax_detail
                        })
                    }

                }

                var labours = services[i].labour;
                var labour = [];

                if (labours.length > 0) {
                    labour = labours
                }
                else {
                    var tax_info = await Tax.findOne({ tax: "18.0% GST" }).exec();
                    var tax_rate = tax_info.detail;
                    var service = services[i].service;
                    var amount = Math.ceil(services[i].labour_cost) * quantity;
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
                                })
                            }
                            else {
                                base = base - t
                                labour_tax.push({
                                    tax: tax_info.tax, tax_rate: tax_info.rate,
                                    rate: parseFloat(tax_info.rate.toFixed(2)),
                                    amount: parseFloat(tax_on_amount.toFixed(2))
                                })
                            }
                        }
                    }

                    labour.push({
                        item: services[i].service,
                        quantity: quantity,
                        rate: parseFloat(services[i].labour_cost),
                        base: parseFloat(base.toFixed(2)),
                        amount: parseFloat(amount),
                        customer_dep: 100,
                        insurance_dep: 0,
                        discount: 0,
                        amount_is_tax: "inclusive",
                        tax_amount: _.sumBy(labour_tax, x => x.amount),
                        tax: tax_info.tax, tax_rate: tax_info.rate,
                        tax_info: {
                            tax: tax_info.tax, tax_rate: tax_info.rate,
                            rate: tax_info.rate,
                            base: parseFloat(base.toFixed(2)),
                            detail: labour_tax
                        }
                    })
                }

                var opening_fittings = services[i].opening_fitting;
                var opening_fitting = [];

                if (opening_fittings.length > 0) {
                    opening_fitting = opening_fittings
                }
                else {
                    if (services[i].of_cost != 0) {
                        var tax_info = await Tax.findOne({ tax: "18.0% GST" }).exec();
                        var tax_rate = tax_info.detail;
                        var service = services[i].service;
                        var amount = Math.ceil(services[i].of_cost) * quantity;
                        var base = amount;
                        var fitting_tax = [];

                        var x = (100 + tax_info.rate) / 100;
                        var tax_on_amount = amount / x;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    base = base - t
                                    fitting_tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                                else {
                                    base = base - t
                                    fitting_tax.push({
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(tax_on_amount.toFixed(2))
                                    })
                                }
                            }
                        }

                        opening_fitting.push({
                            item: services[i].service,
                            quantity: quantity,
                            rate: parseFloat(services[i].of_cost),
                            base: parseFloat(base.toFixed(2)),
                            discount: 0,
                            amount: parseFloat(amount),
                            customer_dep: 100,
                            insurance_dep: 0,
                            amount_is_tax: "inclusive",
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: {
                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                base: parseFloat(base.toFixed(2)),
                                detail: fitting_tax
                            }
                        })
                    }
                }

                if (services[i].customer_approval == true) {
                    var cost = _.sumBy(part, x => x.amount) + _.sumBy(labour, x => x.amount) + _.sumBy(opening_fitting, x => x.amount);
                    logged_remark = logged_remark + "\n" + "" + services[i].service + " Rs/-" + cost;
                }

                bookingService.push({
                    source: services[i].source,
                    service: services[i].service,
                    mileage: services[i].mileage,
                    parts: part,
                    labour: labour,
                    opening_fitting: opening_fitting,
                    hours: services[i].hours,
                    parts_visible: parts_visible,
                    quantity: quantity,
                    description: services[i].description,
                    part_cost: _.sumBy(part, x => x.amount),
                    labour_cost: _.sumBy(labour, x => x.amount),
                    of_cost: _.sumBy(opening_fitting, x => x.amount),
                    exceeded_cost: services[i].exceeded_cost,
                    cost: _.sumBy(part, x => x.amount) + _.sumBy(labour, x => x.amount) + _.sumBy(opening_fitting, x => x.amount),
                    discount: _.sumBy(labour, x => x.discount) + _.sumBy(opening_fitting, x => x.discount) + _.sumBy(part, x => x.discount),
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

            var approved = _.filter(bookingService, customer_approval => customer_approval.customer_approval == true);
            if (approved.length > 0) {

                var policy_clause = 0
                if (booking.payment.policy_clause) {
                    policy_clause = booking.payment.policy_clause;
                }
                var salvage = 0
                if (booking.payment.salvage) {
                    salvage = booking.payment.salvage;
                }

                var paid_total = booking.payment.paid_total;
                var labour_cost = _.sumBy(bookingService, x => x.labour_cost);
                var part_cost = _.sumBy(bookingService, x => x.part_cost);
                var of_cost = _.sumBy(bookingService, x => x.of_cost);
                var discount_total = _.sumBy(bookingService, x => x.discount);

                var careager_cash = await q.all(fun.getBookingCarEagerCash(booking._id));

                var pick_up_charges = booking.payment.pick_up_charges;

                var payment_total = labour_cost + part_cost + of_cost + discount_total + policy_clause + salvage + pick_up_charges;

                var estimate_cost = labour_cost + part_cost + of_cost + policy_clause + salvage + pick_up_charges - careager_cash;

                var due_amount = _.sumBy(approved, x => x.labour_cost) + _.sumBy(approved, x => x.part_cost) + _.sumBy(approved, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (paid_total + careager_cash);

                var due = {
                    due: Math.ceil(due_amount.toFixed(2))
                };

                var payment = {
                    estimate_cost: estimate_cost,
                    total: parseFloat(payment_total.toFixed(2)),
                    careager_cash: careager_cash,
                    of_cost: parseFloat(of_cost.toFixed(2)),
                    labour_cost: parseFloat(labour_cost.toFixed(2)),
                    part_cost: parseFloat(part_cost.toFixed(2)),
                    payment_mode: booking.payment.payment_mode,
                    payment_status: booking.payment.payment_status,
                    coupon: booking.payment.coupon,
                    coupon_type: booking.payment.coupon_type,
                    discount_by: booking.payment.discount_by,
                    discount_type: booking.payment.discount_type,
                    discount: booking.payment.discount,
                    discount_total: discount_total,
                    terms: booking.payment.terms,
                    pick_up_limit: booking.payment.pick_up_limit,
                    policy_clause: policy_clause,
                    salvage: salvage,
                    pick_up_charges: pick_up_charges,
                    paid_total: booking.payment.paid_total,
                    discount_applied: booking.payment.discount_applied,
                    transaction_id: booking.payment.transaction_id,
                    transaction_date: booking.payment.transaction_date,
                    transaction_status: booking.payment.transaction_status,
                    transaction_response: booking.payment.transaction_response
                };

                if (booking.job_no == "") {
                    if (booking.date && booking.time_slot) {
                        var stage = "Booking"
                        var status = "Confirmed";
                    }
                    else {
                        var stage = "Estimation"
                        var status = "Approved";
                    }
                }
                else {
                    if (booking.status != "JobOpen") {
                        var stage = "";
                        var status = "";
                    }
                    else {
                        var stage = "In-Process";
                        var status = "In-Process"
                    }
                }

                Booking.findOneAndUpdate({ _id: booking._id }, { $set: { services: bookingService, payment: payment, due: due, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Error Occurred Try again",
                            responseData: err
                        });
                    }
                    else {
                        if (status != "") {
                            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { status: status, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                                if (err) {
                                    return res.status(400).json({
                                        responseCode: 400,
                                        responseMessage: "Error Occurred Try again",
                                        responseData: err
                                    });
                                }
                                else {
                                    var activity = {
                                        user: loggedInDetails._id,
                                        name: loggedInDetails.name,
                                        stage: stage,
                                        activity: status,
                                    }

                                    fun.bookingLog(booking._id, activity);
                                }
                            });
                        }

                        var activity = {
                            user: loggedInDetails._id,
                            name: loggedInDetails.name,
                            stage: "Approval",
                            activity: logged_remark,
                        }

                        fun.bookingLog(booking._id, activity);


                        var notify = {
                            receiver: [booking.advisor],
                            activity: "booking",
                            tag: "Approved",
                            source: booking._id,
                            sender: booking.user,
                            points: 0
                        };

                        fun.newNotification(notify);

                        if (booking.converted) {
                            if (booking.manager) {
                                var notify = {
                                    receiver: [booking.manager],
                                    activity: "booking",
                                    tag: "Approved",
                                    source: booking._id,
                                    sender: booking.user,
                                    points: 0
                                };

                                fun.newNotification(notify);
                            }
                        }
                        event.jobSms(notify);

                        var updated = await Booking.findById(booking.id).exec();

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Service has been added...",
                            responseData: updated
                        });
                    }
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Approve service before save...",
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

router.get('/service/description/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Service not mention",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        if (req.query.type == "services") {
            var data = await Service.findById(req.query.id).exec();
            if (data) {
                var description = "";
                if (data.description) {
                    description = data.description;
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: description,
                    responseData: {}
                });
            }
            else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }

        }
        else if (req.query.type == "collision") {
            var data = await Collision.findById(req.query.id).exec();
            if (data) {
                var description = "";
                if (data.description) {
                    description = data.description;
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: description,
                    responseData: {}
                });
            }
            else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        }
        else if (req.query.type == "washing") {
            var data = await Washing.findById(req.query.id).exec();
            if (data) {
                var description = "";
                if (data.description) {
                    description = data.description;
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: description,
                    responseData: {}
                });
            }
            else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        }
        else if (req.query.type == "detailing") {
            var data = await Detailing.findById(req.query.id).exec();
            if (data) {
                var description = "";
                if (data.description) {
                    description = data.description;
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: description,
                    responseData: {}
                });
            }
            else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        }
        else if (req.query.type == "customization") {
            var data = await Customization.findById(req.query.id).exec();
            if (data) {
                var description = "";
                if (data.description) {
                    description = data.description;
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: description,
                    responseData: {}
                });
            }
            else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        }
        else if (req.query.type == "product") {
            var data = await Product.findById(req.query.id).exec();
            if (data) {
                var description = "";
                if (data.description) {
                    description = data.description;
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: description,
                    responseData: {}
                });
            }
            else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        }
        else if (req.query.type == "package") {
            var data = await Package.findById(req.query.id).exec();
            if (data) {
                var description = "";
                if (data.description) {
                    description = data.description;
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: description,
                    responseData: {}
                });
            }
            else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        }

        else if (req.query.type == "addOn") {
            var data = await Package.findById(req.query.id).exec();
            if (data) {
                var description = "";
                if (data.description) {
                    description = data.description;
                }
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: description,
                    responseData: {}
                });
            }
            else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Invalid request",
                responseData: {},
            });
        }

    }
});

router.get('/service/gallery/get', async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Service not mention",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var gallery = []
        if (req.query.type == "services") {
            var data = await Service.findById(req.query.id).exec();
            if (data) {
                if (Object.keys(data.gallery).length > 0) {
                    gallery = data.gallery;
                }
            }
        }
        else if (req.query.type == "collision") {
            var data = await Collision.findById(req.query.id).exec();
            if (data) {
                if (Object.keys(data.gallery).length > 0) {
                    gallery = data.gallery;
                }
            }
        }

        else if (req.query.type == "detailing") {
            var data = await Detailing.findById(req.query.id).exec();
            if (data) {
                if (Object.keys(data.gallery).length > 0) {
                    gallery = data.gallery;
                }
            }
        }
        else if (req.query.type == "customization") {
            var data = await Customization.findById(req.query.id).exec();
            if (data) {
                if (Object.keys(data.gallery).length > 0) {
                    gallery = data.gallery;
                }
            }
        }

        // console.log(gallery.length)

        if (gallery.length > 0) {
            var data = []
            for (var i = 0; i < gallery.length; i++) {
                data.push({
                    id: gallery[i]._id,
                    type: gallery[i].type,
                    source: req.query.id,
                    file_address: gallery[i].file
                })
            }

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: data
            });
        }
        else {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: {}
            });
        }
    }
});

router.post('/bookings/time-slot/', xAccessToken.token, async function (req, res, next) {
    var rules = {
        business: 'required',
        date: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Service not mention",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        if (req.body.booking) {
            var booking = await Booking.findById(req.body.booking).exec();
            if (booking) {
                var body = booking.services;
                if (body.length <= 0) {
                    body.push({
                        type: "services"
                    });
                }
            }
        }
        else if (req.body.label) {
            var body = await q.all(getPackageService(req.body.label));
        }
        else {
            var body = req.body.services;
        }

        body = _.uniqBy(body, 'type');



        var slots = [];
        var date = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
        var next = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
        next.setDate(date.getDate() + 1);

        var business = req.body.business;

        for (var i = 0; i < body.length; i++) {
            if (body[i].type == "addOn") {
                body[i].type = "services"
            }

            var check = await BookingTiming.find({ business: business }).count().exec();

            if (check > 0) {
                await BookingTiming.find({ business: business, category: body[i].type })
                    .sort({ sort: 1 })
                    .cursor().eachAsync(async (timing) => {

                        var slot = await Booking.find({
                            time_slot: timing.slot,
                            is_services: true,
                            business: business,
                            date: { $gte: date, $lt: next },
                            services: { $elemMatch: { type: body[i].type } },
                            status: { $nin: ["Inactive", "Rejected", "Cancelled", "Completed", "Closed"] },
                        }).count().exec();

                        if (slot < timing.booking_per_slot) {
                            slot = timing.booking_per_slot - slot
                            slots.push({
                                slot: timing.slot,
                                count: slot,
                                sort: timing.sort,
                                type: timing.category,
                                status: true
                            });
                        }
                        else {
                            slots.push({
                                slot: timing.slot,
                                count: slot,
                                sort: timing.sort,
                                type: timing.category,
                                status: false
                            });
                        }

                    });
            }
            else {
                var a = await BookingTiming.find({ business: null, category: body[i].type }).exec();

                await BookingTiming.find({ business: null, category: body[i].type })
                    .sort({ sort: 1 })
                    .cursor().eachAsync(async (timing) => {
                        var slot = await Booking.find({
                            time_slot: timing.slot,
                            is_services: true,
                            business: business,
                            date: { $gte: date, $lt: next },
                            services: { $elemMatch: { type: body[i].type } },
                            status: { $nin: ["Inactive", "Rejected", "Cancelled", "Completed", "Closed"] },
                        }).count().exec();

                        if (slot < timing.booking_per_slot) {
                            slot = timing.booking_per_slot - slot
                            slots.push({
                                slot: timing.slot,
                                count: slot,
                                sort: timing.sort,
                                type: timing.category,
                                status: true
                            });
                        }
                        else {
                            slots.push({
                                slot: timing.slot,
                                count: slot,
                                sort: timing.sort,
                                type: timing.category,
                                status: false
                            });
                        }
                    });
            }
        }

        slots = _.orderBy(slots, 'count', 'desc');
        slots = _.uniqBy(slots, 'slot');
        slots = _.orderBy(slots, 'sort', 'asc');

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: slots
        })
    }
});

router.post('/booking/coupon/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Booking is required",
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
        var code = "";
        var type = "";
        var discount_by = "";
        var discount_type = "";
        var booking = await Booking.findOne({ _id: req.body.id }).exec();

        if (booking) {
            var bookingService = [];
            var services = booking.services;
            var careager_cash = await q.all(fun.getCarEagerCash(booking._id));


            if (booking.payment.total != 0 && booking.package == null) {
                type = req.body.type;

                if (type == "coupon") {
                    discount_by = "coupon";
                    discount_type = "coupon";
                    var discount_eligible = [];
                    var coupon = await Coupon.findOne({ code: req.body.coupon.toUpperCase(), is_product: false }).exec();
                    var used = await CouponUsed.findOne({ code: req.body.coupon.toUpperCase(), user: booking.user }).count().exec();

                    if (coupon) {
                        if (used < coupon.usage_limit) {
                            var serverTime = moment.tz(new Date(), req.headers['tz']);
                            var bar = moment.tz(coupon.expired_at, req.headers['tz']);
                            var baz = bar.diff(serverTime);
                            if (baz > 0) {
                                var limit = await CouponUsed.findOne({ code: req.body.coupon.toUpperCase() }).count().exec();
                                if (limit <= coupon.limit) {
                                    code = req.body.coupon.toUpperCase();
                                    discount_type = "coupon";
                                    if (coupon.coupon_on == "total") {
                                        if (coupon.for == "general") {
                                            var discount_eligible = _.filter(booking.services, claim => claim.claim == false);
                                            if (discount_eligible.length > 0) {
                                                var discount_eligible_labour = _.map(discount_eligible, 'labour');
                                                var discount_eligible_part = _.map(discount_eligible, 'parts');

                                                var discount_eligible_labour_cost = 0;

                                                for (var k = 0; k < discount_eligible_labour.length; k++) {
                                                    discount_eligible_labour_cost = _.sumBy(discount_eligible_labour[k], x => x.rate * x.quantity) + discount_eligible_labour_cost;
                                                }

                                                for (var p = 0; p < discount_eligible_part.length; p++) {
                                                    discount_eligible_labour_cost = _.sumBy(discount_eligible_part[p], x => x.rate * x.quantity) + discount_eligible_labour_cost;
                                                }
                                            }
                                            else {
                                                return res.status(400).json({
                                                    responseCode: 400,
                                                    responseMessage: "Coupon not valid for this services",
                                                    responseData: {}
                                                });
                                            }
                                        }

                                        else if (coupon.for == "category") {
                                            var filter = _.filter(booking.services, claim => claim.claim == false)
                                            discount_eligible = _.filter(filter, type => type.type == coupon.label);
                                            if (discount_eligible.length > 0) {
                                                var discount_eligible_labour = _.map(discount_eligible, 'labour');
                                                var discount_eligible_part = _.map(discount_eligible, 'parts');

                                                var discount_eligible_labour_cost = 0;

                                                for (var k = 0; k < discount_eligible_labour.length; k++) {
                                                    discount_eligible_labour_cost = _.sumBy(discount_eligible_labour[k], x => x.rate * x.quantity) + discount_eligible_labour_cost;
                                                }

                                                for (var p = 0; p < discount_eligible_part.length; p++) {
                                                    discount_eligible_labour_cost = _.sumBy(discount_eligible_part[p], x => x.rate * x.quantity) + discount_eligible_labour_cost;
                                                }
                                            }
                                            else {
                                                return res.status(400).json({
                                                    responseCode: 400,
                                                    responseMessage: "Coupon not valid for this services",
                                                    responseData: {}
                                                });
                                            }
                                        }
                                        else if (coupon.for == "specific") {
                                            var filter = _.filter(booking.services, claim => claim.claim == false)
                                            discount_eligible = _.filter(filter, service => service.service == coupon.label);
                                            if (discount_eligible.length > 0) {
                                                var discount_eligible_labour = _.map(discount_eligible, 'labour');
                                                var discount_eligible_part = _.map(discount_eligible, 'parts');

                                                var discount_eligible_labour_cost = 0;

                                                for (var k = 0; k < discount_eligible_labour.length; k++) {
                                                    discount_eligible_labour_cost = _.sumBy(discount_eligible_labour[k], x => x.rate * x.quantity) + discount_eligible_labour_cost;
                                                }

                                                for (var p = 0; p < discount_eligible_part.length; p++) {
                                                    discount_eligible_labour_cost = _.sumBy(discount_eligible_part[p], x => x.rate * x.quantity) + discount_eligible_labour_cost;
                                                }
                                            }
                                            else {
                                                return res.status(400).json({
                                                    responseCode: 400,
                                                    responseMessage: "Coupon not valid for this services",
                                                    responseData: {}
                                                });
                                            }
                                        }
                                    }
                                    else {
                                        if (coupon.for == "general") {
                                            discount_eligible = _.filter(booking.services, claim => claim.claim == false);
                                            if (discount_eligible.length > 0) {
                                                var discount_eligible_labour = _.map(discount_eligible, 'labour');
                                                var discount_eligible_labour_cost = 0;
                                                for (var k = 0; k < discount_eligible_labour.length; k++) {
                                                    discount_eligible_labour_cost = _.sumBy(discount_eligible_labour[k], x => x.rate * x.quantity) + discount_eligible_labour_cost;
                                                }
                                            }
                                            else {
                                                return res.status(400).json({
                                                    responseCode: 400,
                                                    responseMessage: "Coupon not valid for this services",
                                                    responseData: {}
                                                });
                                            }
                                        }

                                        else if (coupon.for == "category") {
                                            var filter = _.filter(booking.services, claim => claim.claim == false)
                                            discount_eligible = _.filter(filter, type => type.type == coupon.label);

                                            if (discount_eligible.length > 0) {
                                                var discount_eligible_labour = _.map(discount_eligible, 'labour');
                                                var discount_eligible_labour_cost = 0;
                                                for (var k = 0; k < discount_eligible_labour.length; k++) {
                                                    discount_eligible_labour_cost = _.sumBy(discount_eligible_labour[k], x => x.rate * x.quantity) + discount_eligible_labour_cost;
                                                }
                                            }
                                            else {
                                                return res.status(400).json({
                                                    responseCode: 400,
                                                    responseMessage: "Coupon not valid for this services",
                                                    responseData: {}
                                                });
                                            }
                                        }

                                        else if (coupon.for == "specific") {
                                            var filter = _.filter(booking.services, claim => claim.claim == false)
                                            discount_eligible = _.filter(filter, service => service.service == coupon.label);
                                            if (discount_eligible.length > 0) {
                                                var discount_eligible_labour = _.map(discount_eligible, 'labour');
                                                var discount_eligible_labour_cost = 0;
                                                for (var k = 0; k < discount_eligible_labour.length; k++) {
                                                    discount_eligible_labour_cost = _.sumBy(discount_eligible_labour[k], x => x.rate * x.quantity) + discount_eligible_labour_cost;
                                                }
                                            }
                                            else {
                                                return res.status(400).json({
                                                    responseCode: 400,
                                                    responseMessage: "Coupon not valid for this services",
                                                    responseData: {}
                                                });
                                            }
                                        }
                                    }
                                }
                                else {
                                    return res.status(400).json({
                                        responseCode: 400,
                                        responseMessage: "Coupon has been expired",
                                        responseData: {}
                                    });
                                }
                            }
                            else {
                                return res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Coupon has been expired",
                                    responseData: {}
                                });
                            }
                        }
                        else {
                            return res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Coupon has been used",
                                responseData: {}
                            });
                        }
                    }
                    else {
                        return res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Coupon doesn't Exist",
                            responseData: {}
                        });
                    }

                    var total_labour_cost = _.sumBy(services, x => x.labour_cost);

                    // if(total_labour_cost<careager_cash)
                    // {
                    //     discount_total = 0;
                    // }

                    for (var i = 0; i < services.length; i++) {
                        if (services[i].claim == true) {
                            bookingService.push(services[i])
                        }
                        else {
                            var labour_list = services[i].labour;

                            var labours = [];

                            if (labour_list) {
                                for (var l = 0; l < labour_list.length; l++) {
                                    var discount_total = 0;
                                    var total = 0;
                                    var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                                    var tax = [];
                                    var rate = labour_list[l].rate;
                                    var amount = parseFloat(labour_list[l].rate) * parseFloat(labour_list[l].quantity);
                                    var tax_rate = tax_info.detail;
                                    var base = amount;

                                    if (coupon.coupon_on == "total") {
                                        if (coupon.for == "category") {
                                            if (services[i].type == coupon.label) {
                                                if (coupon.type == "percent") {

                                                    discount_by = "percent";
                                                    discount = parseFloat(coupon.discount);
                                                    if (total_labour_cost < careager_cash) {
                                                        discount_total = 0;
                                                    }

                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = amount * (discount / 100);
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else if (coupon.for == "specific") {
                                            if (services[i].service == coupon.label) {
                                                if (coupon.type == "percent") {
                                                    discount_by = "percent";
                                                    discount = parseFloat(coupon.discount);
                                                    if (total_labour_cost < careager_cash) {
                                                        discount_total = 0;
                                                    }

                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = amount * (discount / 100);
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        if (coupon.for == "general") {
                                            if (coupon.type == "percent") {
                                                discount_by = "percent";
                                                discount = parseFloat(coupon.discount);


                                                if (!isNaN(discount) && discount > 0) {
                                                    discount_total = amount * (discount / 100);
                                                    amount = amount - parseFloat(discount_total.toFixed(2))
                                                    if (amount < 0) {
                                                        amount = 0
                                                    }
                                                }
                                            }
                                            else if (coupon.type == "price") {
                                                discount_by = "value";
                                                discount = parseFloat(coupon.discount);


                                                if (!isNaN(discount) && discount > 0) {
                                                    discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                    amount = amount - parseFloat(discount_total.toFixed(2))
                                                    if (amount < 0) {
                                                        amount = 0
                                                    }
                                                }
                                            }
                                        }
                                        else if (coupon.for == "category") {
                                            if (services[i].type == coupon.label) {
                                                if (coupon.type == "percent") {
                                                    discount_by = "percent";
                                                    discount = parseFloat(coupon.discount);
                                                    if (total_labour_cost < careager_cash) {
                                                        discount_total = 0;
                                                    }
                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = amount * (discount / 100);
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else if (coupon.for == "specific") {
                                            if (services[i].service == coupon.label) {
                                                if (coupon.type == "percent") {
                                                    discount_by = "percent";
                                                    discount = parseFloat(coupon.discount);
                                                    if (total_labour_cost < careager_cash) {
                                                        discount_total = 0;
                                                    }
                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = amount * (discount / 100);
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                if (coupon.type == "fixed") {
                                                    labour_list[l].amount_is_tax = "inclusive";
                                                    discount_by = "value";
                                                    discount = parseFloat(coupon.discount);
                                                    if (total_labour_cost < careager_cash) {
                                                        discount_total = 0;
                                                    }
                                                    discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                    discount = amount - discount_total;
                                                    amount = parseFloat(discount_total.toFixed(2));
                                                    discount_total = discount
                                                    if (amount < 0) {
                                                        amount = 0
                                                    }
                                                }

                                                else if (coupon.type == "price") {
                                                    discount_by = "value";
                                                    discount = parseFloat(coupon.discount);
                                                    if (total_labour_cost < careager_cash) {
                                                        discount_total = 0;
                                                    }
                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    if (labour_list[l].amount_is_tax == "exclusive") {
                                        var tax_on_amount = amount;
                                        if (tax_rate.length > 0) {
                                            for (var r = 0; r < tax_rate.length; r++) {
                                                if (tax_rate[r].rate != tax_info.rate) {
                                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                    amount = amount + t;
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
                                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                                        rate: tax_info.rate,
                                                        amount: parseFloat(t.toFixed(2))
                                                    });
                                                }
                                            }

                                            base = base - discount_total;
                                        }
                                        total = total + amount;
                                    }

                                    var tax_details = {
                                        tax: tax_info.tax,
                                        rate: tax_info.rate,
                                        amount: total,
                                        detail: tax
                                    }

                                    labours.push({
                                        item: labour_list[l].item,
                                        source: labour_list[l].source,
                                        rate: parseFloat(labour_list[l].rate),
                                        quantity: parseFloat(labour_list[l].quantity),
                                        base: parseFloat(base.toFixed(2)),
                                        discount: parseFloat(discount_total.toFixed(2)),
                                        amount: total,
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
                            else {
                                labours = labour_list
                            }

                            var parts_list = services[i].parts;

                            var parts = [];

                            if (parts_list) {
                                for (var l = 0; l < parts_list.length; l++) {
                                    var discount_total = 0;
                                    var total = 0;
                                    var tax_info = await Tax.findOne({ tax: parts_list[l].tax }).exec();

                                    var tax = [];
                                    var rate = parts_list[l].rate;
                                    var amount = parseFloat(parts_list[l].rate) * parseFloat(parts_list[l].quantity);
                                    var tax_rate = tax_info.detail;
                                    var base = amount;

                                    if (coupon.coupon_on == "total") {
                                        if (coupon.for == "category") {
                                            if (services[i].type == coupon.label) {
                                                if (coupon.type == "percent") {
                                                    discount_by = "percent";
                                                    discount = parseFloat(coupon.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = amount * (discount / 100);
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                else if (coupon.type == "price") {
                                                    discount_by = "value";
                                                    discount = parseFloat(coupon.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = amount - parseFloat(discount_total.toFixed(2))

                                                        // console.log(amount)

                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else if (coupon.for == "specific") {
                                            if (services[i].service == coupon.label) {
                                                if (coupon.type == "percent") {
                                                    discount_by = "percent";
                                                    discount = parseFloat(coupon.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = amount * (discount / 100);
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                                else if (coupon.type == "price") {
                                                    discount_by = "value";
                                                    discount = parseFloat(coupon.discount);
                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = (amount / discount_eligible_labour_cost) * discount;
                                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                                        if (amount < 0) {
                                                            amount = 0
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }


                                    if (parts_list[l].amount_is_tax == "exclusive") {
                                        var tax_on_amount = amount;
                                        if (tax_rate.length > 0) {
                                            for (var r = 0; r < tax_rate.length; r++) {
                                                if (tax_rate[r].rate != tax_info.rate) {
                                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                    amount = amount + t;
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

                                    if (parts_list[l].amount_is_tax == "inclusive") {
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

                                            base = base - discount_total;
                                        }
                                        total = total + amount;
                                    }

                                    var tax_details = {
                                        tax: tax_info.tax,
                                        rate: tax_info.rate,
                                        amount: total,
                                        detail: tax
                                    }

                                    parts.push({
                                        _id: parts_list[l]._id,
                                        item: parts_list[l].item,
                                        source: parts_list[l].source,
                                        quantity: parts_list[l].quantity,
                                        hsn_sac: parts_list[l].hsn_sac,
                                        part_no: parts_list[l].part_no,
                                        rate: parts_list[l].rate,
                                        base: parseFloat(base.toFixed(2)),
                                        amount: parseFloat(amount),
                                        tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                        amount_is_tax: parts_list[l].amount_is_tax,
                                        discount: parseFloat(discount_total.toFixed(2)),
                                        customer_dep: parseFloat(parts_list[l].customer_dep),
                                        insurance_dep: parseFloat(parts_list[l].insurance_dep),
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        issued: parts_list[l].issued,
                                        tax_info: tax_details
                                    });
                                }
                            }
                            else {
                                parts = parts_list
                            }

                            bookingService.push({
                                quantity: services[i].quantity,
                                part_cost: _.sumBy(parts, x => x.amount),
                                labour_cost: _.sumBy(labours, x => x.amount),
                                of_cost: services[i].of_cost,
                                exceeded_cost: services[i].exceeded_cost,
                                part_rate: services[i].part_rate,
                                labour_rate: services[i].labour_rate,
                                of_rate: services[i].of_rate,
                                parts: parts,
                                labour: labours,
                                cost: _.sumBy(labours, x => x.amount) + _.sumBy(parts, x => x.amount) + services[i].of_cost,
                                opening_fitting: services[i].opening_fitting,
                                part_cost_editable: services[i].part_cost_editable,
                                labour_cost_editable: services[i].part_cost_editable,
                                of_cost_editable: services[i].part_cost_editable,
                                description: services[i].description,
                                service: services[i].service,
                                type: services[i].type,
                                claim: services[i].claim,
                                custom: services[i].custom,
                                discount: _.sumBy(labours, x => x.discount) + _.sumBy(parts, x => x.discount),
                                customer_approval: services[i].customer_approval,
                                surveyor_approval: services[i].surveyor_approval,
                                source: services[i].source,
                            });
                        }
                    }
                }
                else {
                    bookingService = services;
                }
            }
            else {
                bookingService = services;
            }


            var paid_total = booking.payment.paid_total;
            var pick_up_charges = booking.payment.pick_up_charges;
            var labour_cost = _.sumBy(bookingService, x => x.labour_cost);
            var part_cost = _.sumBy(bookingService, x => x.part_cost);
            var of_cost = _.sumBy(bookingService, x => x.of_cost);
            var discount_total = _.sumBy(bookingService, x => x.discount);

            var policy_clause = 0
            if (booking.payment.policy_clause) {
                policy_clause = booking.payment.policy_clause;
            }
            var salvage = 0
            if (booking.payment.salvage) {
                salvage = booking.payment.salvage;
            }

            var total = labour_cost + part_cost + of_cost + discount_total + policy_clause + salvage + pick_up_charges;
            var due = part_cost + labour_cost + of_cost + policy_clause + salvage + pick_up_charges - careager_cash;

            var payment = {
                estimate_cost: due,
                careager_cash: careager_cash,
                total: parseFloat(total.toFixed(2)),
                of_cost: parseFloat(of_cost.toFixed(2)),
                labour_cost: parseFloat(labour_cost.toFixed(2)),
                part_cost: parseFloat(part_cost.toFixed(2)),
                payment_mode: booking.payment.payment_mode,
                payment_status: booking.payment.payment_status,
                coupon: code,
                coupon_type: "",
                discount_by: discount_by,
                discount_type: discount_type,
                discount: discount,
                discount_total: discount_total,
                policy_clause: booking.payment.policy_clause,
                salvage: booking.payment.salvage,
                terms: booking.payment.terms,
                pick_up_limit: booking.payment.pick_up_limit,
                pick_up_charges: booking.payment.pick_up_charges,
                paid_total: 0,
                discount_applied: booking.payment.discount_applied,
                transaction_id: booking.payment.transaction_id,
                transaction_date: booking.payment.transaction_date,
                transaction_status: booking.payment.transaction_status,
                transaction_response: booking.payment.transaction_response
            };

            var due = {
                due: Math.ceil(due.toFixed(2))
            };

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { services: bookingService, payment: payment, due: due, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error",
                        responseData: err
                    });
                }
                else {
                    var update = await Booking.findById(booking.id).exec();
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Discount has been applied",
                        responseData: {
                            payment: payment,
                            due: due
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
        var coupon = await Coupon.findOne({ code: req.body.coupon, is_product: false }).exec();
        var bookingService = [];
        if (booking) {
            var services = booking.services;

            for (var i = 0; i < services.length; i++) {
                if (services[i].claim == true) {
                    bookingService.push(services[i])
                }
                else {
                    var labour_list = services[i].labour;

                    var labours = [];

                    if (labour_list) {
                        for (var l = 0; l < labour_list.length; l++) {
                            var discount_total = 0;
                            var total = 0;
                            var tax_info = await Tax.findOne({ tax: labour_list[l].tax }).exec();

                            var tax = [];
                            var rate = labour_list[l].rate;
                            var amount = parseFloat(labour_list[l].rate) * parseFloat(labour_list[l].quantity);
                            var tax_rate = tax_info.detail;
                            var base = amount;



                            if (labour_list[l].amount_is_tax == "exclusive") {
                                var tax_on_amount = amount;
                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            amount = amount + t;
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
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }

                                    base = base - discount_total;
                                }
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }

                            labours.push({
                                item: labour_list[l].item,
                                source: labour_list[l].source,
                                rate: parseFloat(labour_list[l].rate),
                                quantity: parseFloat(labour_list[l].quantity),
                                base: parseFloat(base.toFixed(2)),
                                discount: parseFloat(discount_total.toFixed(2)),
                                amount: total,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount_is_tax: labour_list[l].amount_is_tax,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax_details
                            });
                        }
                    }
                    else {
                        labours = labour_list
                    }

                    var parts_list = services[i].parts;

                    var parts = [];

                    if (parts_list) {
                        for (var l = 0; l < parts_list.length; l++) {
                            var discount_total = 0;
                            var total = 0;
                            var tax_info = await Tax.findOne({ tax: parts_list[l].tax }).exec();

                            var tax = [];
                            var rate = parts_list[l].rate;
                            var amount = parseFloat(parts_list[l].rate) * parseFloat(parts_list[l].quantity);
                            var tax_rate = tax_info.detail;
                            var base = amount;

                            if (parts_list[l].amount_is_tax == "exclusive") {
                                var tax_on_amount = amount;
                                if (tax_rate.length > 0) {
                                    for (var r = 0; r < tax_rate.length; r++) {
                                        if (tax_rate[r].rate != tax_info.rate) {
                                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            amount = amount + t;
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

                            if (parts_list[l].amount_is_tax == "inclusive") {
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

                                    base = base - discount_total;
                                }
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }

                            parts.push({
                                _id: parts_list[l]._id,
                                item: parts_list[l].item,
                                source: parts_list[l].source,
                                quantity: parts_list[l].quantity,
                                hsn_sac: parts_list[l].hsn_sac,
                                part_no: parts_list[l].part_no,
                                rate: parts_list[l].rate,
                                base: parseFloat(base.toFixed(2)),
                                amount: parseFloat(amount),
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount_is_tax: parts_list[l].amount_is_tax,
                                discount: parseFloat(discount_total.toFixed(2)),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                issued: parts_list[l].issued,
                                tax_info: tax_details
                            });
                        }
                    }
                    else {
                        parts = parts_list
                    }

                    bookingService.push({
                        quantity: services[i].quantity,
                        part_cost: _.sumBy(parts, x => x.amount),
                        labour_cost: _.sumBy(labours, x => x.amount),
                        of_cost: services[i].of_cost,
                        exceeded_cost: services[i].exceeded_cost,
                        part_rate: services[i].part_rate,
                        labour_rate: services[i].labour_rate,
                        of_rate: services[i].of_rate,
                        parts: parts,
                        labour: labours,
                        cost: _.sumBy(labours, x => x.amount) + _.sumBy(parts, x => x.amount) + services[i].of_cost,
                        opening_fitting: services[i].opening_fitting,
                        part_cost_editable: services[i].part_cost_editable,
                        labour_cost_editable: services[i].part_cost_editable,
                        of_cost_editable: services[i].part_cost_editable,
                        description: services[i].description,
                        service: services[i].service,
                        type: services[i].type,
                        claim: services[i].claim,
                        custom: services[i].custom,
                        discount: _.sumBy(labours, x => x.discount) + _.sumBy(parts, x => x.discount),
                        customer_approval: services[i].customer_approval,
                        surveyor_approval: services[i].surveyor_approval,
                        source: services[i].source,
                    });
                }
            }

            var careager_cash = booking.payment.careager_cash;
            var paid_total = booking.payment.paid_total;
            var pick_up_charges = booking.payment.pick_up_charges;
            var labour_cost = _.sumBy(bookingService, x => x.labour_cost);
            var part_cost = _.sumBy(bookingService, x => x.part_cost);
            var of_cost = _.sumBy(bookingService, x => x.of_cost);
            var discount_total = _.sumBy(bookingService, x => x.discount);

            var policy_clause = 0
            if (booking.payment.policy_clause) {
                policy_clause = booking.payment.policy_clause;
            }
            var salvage = 0
            if (booking.payment.salvage) {
                salvage = booking.payment.salvage;
            }

            var total = labour_cost + part_cost + of_cost + discount_total + policy_clause + salvage + pick_up_charges;
            var due = part_cost + labour_cost + of_cost + policy_clause + salvage + pick_up_charges - careager_cash;

            var payment = {
                estimate_cost: due,
                careager_cash: careager_cash,
                total: parseFloat(total.toFixed(2)),
                of_cost: parseFloat(of_cost.toFixed(2)),
                labour_cost: parseFloat(labour_cost.toFixed(2)),
                part_cost: parseFloat(part_cost.toFixed(2)),
                payment_mode: booking.payment.payment_mode,
                payment_status: booking.payment.payment_status,
                coupon: "",
                coupon_type: "",
                discount_by: "",
                discount_type: "",
                discount: 0,
                discount_total: 0,
                policy_clause: booking.payment.policy_clause,
                salvage: booking.payment.salvage,
                terms: booking.payment.terms,
                pick_up_limit: booking.payment.pick_up_limit,
                pick_up_charges: booking.payment.pick_up_charges,
                paid_total: 0,
                discount_applied: booking.payment.discount_applied,
                transaction_id: booking.payment.transaction_id,
                transaction_date: booking.payment.transaction_date,
                transaction_status: booking.payment.transaction_status,
                transaction_response: booking.payment.transaction_response
            };

            var due = {
                due: Math.ceil(due.toFixed(2))
            };

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { services: bookingService, payment: payment, due: due, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error",
                        responseData: err
                    });
                }
                else {
                    var update = await Booking.findById(booking.id).exec();
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Discount has been applied",
                        responseData: {
                            payment: payment,
                            due: due
                        }
                    });
                }
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

router.get('/booking/coupon/list', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var data = [];
    var business = null;

    if (req.query.business) {
        business = req.query.business
    }
    await Coupon.findOne({ is_product: false, business: business })
        .cursor().eachAsync(async (coupon) => {
            if (coupon) {
                var used = await CouponUsed.findOne({ code: coupon.code, user: user }).count().exec();
                if (used < coupon.usage_limit) {
                    var serverTime = moment.tz(new Date(), req.headers['tz']);
                    var bar = moment.tz(coupon.expired_at, req.headers['tz']);
                    var baz = bar.diff(serverTime);
                    // console.log(baz);
                    if (baz > 0) {

                        var limit = await CouponUsed.findOne({ code: coupon.code }).count().exec();
                        if (limit < coupon.limit) {
                            data.push({
                                _id: coupon._id,
                                id: coupon.id,
                                code: coupon.code,
                                limit: coupon.limit,
                                description: coupon.description
                            });
                        }
                    }
                }
            }
        })
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Coupons",
        responseData: data
    })
});

router.get('/payment/data', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var paramarray = new Object();
    var discount = 0;
    var booking = await Booking.findById(req.query.id).exec();
    var getUser = await User.findById(user).exec();
    if (booking) {
        Booking.findOneAndUpdate({ _id: req.query.id }, { $set: { order_id: Math.round(+new Date() / 1000) } }, { new: false }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Error Occurred",
                    responseData: {}
                })
            }
            else {
                var booking = await Booking.findById(req.query.id).exec();
                if (booking.user == user) {
                    if (booking.due) {
                        var total = booking.due.due;
                        total = total.toFixed(2)
                    }
                    else {
                        var total = booking.payment.paid_total;
                        total = total.toFixed(2)
                    }

                    const payload = {
                        ORDER_ID: booking.order_id.toString(),
                        CUST_ID: user.toString(),
                        ACCESS_CODE: "AVYT82GA63AD63TYDA",
                        MERCHANT_ID: "203679",
                        CURRENCY: "INR",
                        TXN_AMOUNT: total.toString(),
                        EMAIL: getUser.email,
                        MOBILE_NO: getUser.contact_no,
                    };

                    var token = jwt.sign(payload, secret);

                    var paramarray = {
                        ORDER_ID: booking.order_id.toString(),
                        CUST_ID: user.toString(),
                        ACCESS_CODE: "AVYT82GA63AD63TYDA",
                        MERCHANT_ID: "203679",
                        CURRENCY: "INR",
                        TXN_AMOUNT: total.toString(),
                        EMAIL: getUser.email,
                        MOBILE_NO: getUser.contact_no,
                        MERCHANT_PARAM1: token,
                        REDIRECT_URL: "http://13.233.36.16/hdfc/ccavResponseHandler.php",
                        CANCEL_URL: "http://13.233.36.16/hdfc/ccavResponseHandler.php",
                        RSA_KEY_URL: "http://13.233.36.16/hdfc/GetRSA.php"
                    }

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Payment Success",
                        responseData: paramarray
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
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking Not Found",
            responseData: {}
        });
    }
});

router.post('/payment/gateway/request', async function (req, res, next) {
    var booking = await Booking.findOne({ order_id: req.body.id }).exec();

    if (booking) {
        if (booking.due != null) {
            if (addZeroes(booking.due.due) == addZeroes(req.body.amount)) {
                var paid_total = booking.payment.paid_total + booking.due.due;
                var transaction = addZeroes(req.body.amount);
            }
            else {
                var paid_total = booking.payment.paid_total + booking.due.due;
                var transaction = addZeroes(req.body.amount);

                var status = "Failure";
                req.body.order_status = "Decline";
                req.body.status_message = "Amount tampering found";
            }
        }
        else {
            if (addZeroes(booking.payment.paid_total) == addZeroes(req.body.amount)) {
                var paid_total = booking.payment.paid_total;
                var transaction = addZeroes(req.body.amount);
            }
            else {
                var paid_total = booking.payment.paid_total;
                var transaction = addZeroes(req.body.amount);

                var status = "Failure";
                req.body.order_status = "Decline";
                req.body.status_message = "Amount tampering found";
            }
        }

        var d1 = booking.date;
        var date = new Date();
        var d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var seconds = (d1.getTime() - d2.getTime()) / 1000;

        if (req.body.order_status == "Success") {
            if (seconds >= 172800) {
                var status = "Confirmed"
            }
            else {
                var status = "Pending"
            }

            var data = {
                status: status,
                payment: {
                    payment_mode: booking.payment.payment_mode,
                    payment_status: req.body.order_status,
                    discount_type: booking.payment.discount_type,
                    coupon: booking.payment.coupon,
                    coupon_type: booking.payment.coupon_type,
                    discount: booking.payment.discount,
                    discount_total: booking.payment.discount_total,
                    labour_cost: Math.ceil(booking.payment.labour_cost),
                    part_cost: Math.ceil(booking.payment.part_cost),
                    paid_total: Math.ceil(paid_total),
                    total: Math.ceil(booking.payment.total),
                    discount_applied: booking.payment.discount_applied,
                    transaction_id: req.body.bank_ref_no,
                    transaction_date: booking.payment.transaction_date,
                    transaction_status: req.body.order_status,
                    transaction_response: req.body.status_message
                },
                due: {
                    due: 0
                },
                updated_at: new Date()
            };

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occurred",
                        responseData: {}
                    })
                }
                else {
                    fun.transactionLog(booking._id, transaction);
                    event.zohoLead(booking._id);

                    booking.services.forEach(async function (service) {
                        if (service.type == "package") {
                            var package = await Package.findOne({ _id: service.source }).exec();
                            var expired_at = new Date();
                            expired_at.setDate(expired_at.getDate() + package.validity);
                            var check = await UserPackage.find({ package: service.source, category: "free", user: booking.user, car: booking.car }).count().exec();

                            if (check <= 0) {
                                UserPackage.create({
                                    user: booking.user,
                                    car: booking.car,
                                    name: package.name,
                                    booking: booking._id,
                                    business: booking.business,
                                    description: package.description,
                                    category: package.category,
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
                                });



                                if (booking.is_services == true) {
                                    Booking.update(
                                        { "_id": booking._id },
                                        { "$pull": { "services": { "source": service.source } } },
                                        function (err, numAffected) {
                                            if (err) {
                                                // console.log(err);
                                            }
                                        }
                                    );
                                }
                            }
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
                                                user: booking.user,
                                                booking: booking._id,
                                                for: service.type,
                                                label: service.service,
                                                created_at: new Date(),
                                                updated_at: new Date()
                                            });
                                        }
                                    }

                                    else if (dis.for == "category") {
                                        if (dis.label == service.type) {
                                            var cpu = await PackageUsed.find({ package: booking.package, booking: booking._id }).count().exec();
                                            // console.log(cpu)
                                            if (cpu == 0) {
                                                PackageUsed.create({
                                                    package: booking.package,
                                                    car: booking.car,
                                                    user: booking.user,
                                                    booking: booking._id,
                                                    for: service.type,
                                                    label: service.service,
                                                    created_at: new Date(),
                                                    updated_at: new Date()
                                                });
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    }

                    if (booking.payment.discount_applied == false) {
                        if (booking.payment.discount_type == "coins") {
                            var getCoins = await User.findById(booking.user).select('careager_cash').exec();
                            var remain = getCoins.careager_cash - booking.payment.discount;

                            if (booking.payment.discount > 0) {
                                var point = {
                                    status: true,
                                    user: booking.user,
                                    activity: "booking",
                                    tag: "usedInBooking",
                                    points: booking.payment.discount,
                                    source: booking._id,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    type: "debit",
                                };

                                Point.create(point).then(async function (point) {
                                    User.findOneAndUpdate({ _id: booking.user }, { $set: { careager_cash: remain } }, { new: false }, async function (err, doc) { });

                                    Booking.findOneAndUpdate({ _id: booking._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                                })
                            }
                        }

                        else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
                            var coupon = await Coupon.findOne({ code: booking.payment.coupon }).exec();
                            var used = await CouponUsed.findOne({ code: booking.payment.coupon, user: booking.user }).count().exec();
                            if (used == 0) {
                                CouponUsed.create({
                                    coupon: coupon._id,
                                    code: coupon.code,
                                    booking: booking._id,
                                    user: booking.user,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                });

                                Booking.findOneAndUpdate({ _id: booking._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                            }
                        }
                    }

                    if (booking.is_services == true) {
                        var notify = {
                            receiver: [booking.business],
                            activity: "booking",
                            tag: "newBooking",
                            source: booking._id,
                            sender: booking.user,
                            points: 0
                        }

                        fun.newNotification(notify);
                        event.bookingMail(booking._id);

                        if (booking.advisor) {
                            var advisor = await User.findById(booking.advisor).exec();
                            var notify = {
                                receiver: [advisor._id],
                                activity: "booking",
                                tag: "newBooking",
                                source: booking._id,
                                sender: booking.user,
                                points: 0
                            }

                            fun.newNotification(notify);
                        }


                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Service has been booked",
                            responseData: {
                                booking_no: booking.booking_no,
                                is_services: booking.is_services
                            }
                        });
                    }
                    else {
                        var notify = {
                            receiver: [booking.business],
                            activity: "package",
                            tag: "newPackage",
                            source: booking._id,
                            sender: booking.user,
                            points: 0
                        }

                        fun.newNotification(notify);
                        event.bookingMail(booking._id);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Package successfully purchased, Book Services Now for added benefits",
                            responseData: {
                                booking_no: booking.booking_no,
                                is_services: booking.is_services
                            }
                        });
                    }
                }
            });
        }
        else {
            if (booking.due) {
                var data = {
                    status: "Failure",
                    payment: {
                        payment_mode: booking.payment.payment_mode,
                        payment_status: req.body.order_status,
                        discount_type: booking.payment.discount_type,
                        coupon: booking.payment.coupon,
                        coupon_type: booking.payment.coupon_type,
                        discount: booking.payment.discount,
                        discount_total: booking.payment.discount_total,
                        labour_cost: Math.ceil(booking.payment.labour_cost),
                        part_cost: Math.ceil(booking.payment.part_cost),
                        paid_total: Math.ceil(booking.payment.paid_total),
                        total: Math.ceil(booking.payment.total),
                        discount_applied: booking.payment.discount_applied,
                        transaction_id: req.body.bank_ref_no,
                        transaction_date: booking.payment.transaction_date,
                        transaction_status: req.body.order_status,
                        transaction_response: req.body.status_message
                    },
                    due: booking.due
                }
            }
            else {
                var data = {
                    status: "Failure",
                    payment: {
                        payment_mode: booking.payment.payment_mode,
                        payment_status: req.body.order_status,
                        discount_type: booking.payment.discount_type,
                        coupon: booking.payment.coupon,
                        coupon_type: booking.payment.coupon_type,
                        discount: booking.payment.discount,
                        discount_total: booking.payment.discount_total,
                        labour_cost: 0,
                        part_cost: 0,
                        paid_total: 0,
                        total: 0,
                        discount_applied: booking.payment.discount_applied,
                        transaction_id: req.body.bank_ref_no,
                        transaction_date: booking.payment.transaction_date,
                        transaction_status: req.body.order_status,
                        transaction_response: req.body.status_message
                    },
                    due: {
                        labour_cost: booking.payment.labour_cost,
                        part_cost: booking.payment.part_cost,
                        due: booking.payment.paid_total
                    }
                }
            }

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                fun.transactionLog(booking._id, req.body.amount);
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occurred",
                        responseData: {}
                    })
                }

                if (booking.payment.discount_applied == false) {
                    if (booking.payment.discount_type == "coins") {
                        var getCoins = await User.findById(booking.user).select('careager_cash').exec();
                        var remain = getCoins.careager_cash - booking.payment.discount;

                        if (booking.payment.discount > 0) {
                            var point = {
                                status: true,
                                user: booking.user,
                                activity: "booking",
                                tag: "usedInBooking",
                                points: booking.payment.discount,
                                source: booking._id,
                                created_at: new Date(),
                                updated_at: new Date(),
                                type: "debit",
                            };

                            Point.create(point).then(async function (point) {
                                User.findOneAndUpdate({ _id: booking.user }, { $set: { careager_cash: remain } }, { new: false }, async function (err, doc) { });

                                Booking.findOneAndUpdate({ _id: booking._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                            })
                        }
                    }

                    else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
                        var coupon = await Coupon.findOne({ code: booking.payment.coupon }).exec();
                        var used = await CouponUsed.findOne({ code: booking.payment.coupon, user: booking.user }).count().exec();
                        if (used == 0) {
                            CouponUsed.create({
                                coupon: coupon._id,
                                code: coupon.code,
                                booking: booking._id,
                                user: booking.user,
                                created_at: new Date(),
                                updated_at: new Date()
                            });

                            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                        }
                    }
                }

                UserPackage.findOneAndUpdate({ booking: booking._id }, { $set: { "status": false, updated_at: new Date() } }, { new: false }, async function (err, doc) { })
            });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Your transaction has been declined",
                responseData: req.body
            })
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking not found",
            responseData: req.body
        })
    }
});

router.get('/booking/convenience', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var data = [];
    var a = null;
    var u = null;
    var c = "";
    var booking = await Booking.findById(req.query.booking).exec();
    if (booking) {
        if (booking.address) {
            a = booking.address
        }

        if (booking.convenience) {
            c = booking.convenience
        }
    }

    var addresses = [];
    await Address.find({ user: decoded.user })
        .cursor().eachAsync(async (address) => {
            if (address._id.equals(a)) {
                var checked = true
            }
            else {
                var checked = false
            }

            addresses.push({
                _id: address._id,
                id: address.id,
                user: address.user,
                address: address.address,
                area: address.area,
                landmark: address.landmark,
                zip: address.zip,
                city: address.city,
                state: address.state,
                checked: checked
            });
        });

    var conveniences = [];
    var check = await BusinessConvenience.find({ business: req.query.business }).count().exec();

    if (check > 0) {
        await BusinessConvenience.find({ business: req.query.business })
            .cursor().eachAsync(async (convenience) => {
                if (convenience.convenience == c) {
                    var checked = true
                }
                else {
                    var checked = false
                }

                conveniences.push({
                    _id: convenience._id,
                    id: convenience.id,
                    convenience: convenience.convenience,
                    charges: convenience.charges,
                    business: convenience.business,
                    checked: checked
                });
            });
    }
    else {
        await BusinessConvenience.find({ business: null })
            .cursor().eachAsync(async (convenience) => {
                if (convenience.convenience == c) {
                    var checked = true
                }
                else {
                    var checked = false
                }

                conveniences.push({
                    _id: convenience._id,
                    id: convenience.id,
                    convenience: convenience.convenience,
                    charges: convenience.charges,
                    business: convenience.business,
                    checked: checked
                });
            });
    }


    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: {
            address: addresses,
            convenience: conveniences
        }
    });
});

function addZeroes(num) {
    var num = Number(num);
    if (String(num).split(".").length < 2 || String(num).split(".")[1].length <= 2) {
        num = num.toFixed(2);
    }
    return num;
}

router.get('/payment/checksum/generate', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var paramarray = new Object();
    var discount = 0;


    var checkBooking = await Booking.findById(req.query.id).exec();
    var getUser = await User.findById(user).exec();
    if (checkBooking) {
        if (req.query.pay) {
            var data = {
                due: {
                    due: checkBooking.due.due,
                    pay: parseFloat(req.query.pay)
                },
                order_id: Math.round(+new Date() / 1000),
                updated_at: new Date()
            };
        }
        else {
            var data = {
                order_id: Math.round(+new Date() / 1000),
                updated_at: new Date()
            }
        }


        Booking.findOneAndUpdate({ _id: req.query.id }, { $set: data }, { new: false }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Error Occurred",
                    responseData: {}
                })
            }
            else {
                var booking = await Booking.findById(req.query.id).exec();
                if (booking.user == user) {
                    if (booking.due) {
                        if (req.query.pay) {
                            var total = booking.due.pay;
                            total = parseFloat(total.toFixed(2))
                        }
                        else {
                            var total = booking.due.due;
                            total = parseFloat(total.toFixed(2))
                        }
                    }
                    else {
                        var total = booking.payment.paid_total;
                        total = parseFloat(total.toFixed(2))
                    }

                    var paramarray = {
                        MID: paytm_config.MID,
                        ORDER_ID: booking.order_id.toString(),
                        CUST_ID: user.toString(),
                        INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
                        CHANNEL_ID: "WAP",
                        TXN_AMOUNT: total.toString(),
                        WEBSITE: paytm_config.WEBSITE,
                        CALLBACK_URL: paytm_config.CALLBACK + 'theia/paytmCallback?ORDER_ID=' + booking.order_id.toString(),
                        EMAIL: getUser.email,
                        MOBILE_NO: getUser.contact_no
                    };

                    //res.json(paramarray)

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
                                responseMessage: "Checksum generated",
                                responseData: data
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
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking Not Found",
            responseData: {}
        });
    }
});

router.get('/payment/transaction/status', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var paramarray = new Object();
    var discount = 0;
    var booking = await Booking.findOne({ order_id: req.query.id, user: user }).exec();
    var getUser = await User.findById(user).exec();
    if (booking) {
        if (booking.user == user) {
            var payment_paid_total = booking.payment.paid_total;
            if (booking.due != null) {
                if (booking.due.pay) {
                    var due_pay = booking.due.pay;
                    var paid_total = parseFloat(payment_paid_total.toFixed(2)) + parseFloat(due_pay.toFixed(2));
                }
                else {
                    var payment_due = booking.due.due;
                    var paid_total = parseFloat(payment_paid_total.toFixed(2)) + parseFloat(payment_due.toFixed(2));
                }
            }
            else {
                var paid_total = parseFloat(payment_paid_total.toFixed(2))

                User.findOneAndUpdate({ _id: booking.user }, {
                    $push: {
                        "bookings": booking._id
                    }
                }, { new: true }, async function (err, doc) {
                    if (err) {
                        // console.log(err)
                    }
                    else {
                        // console.log(doc)
                    }
                });
            }

            var paramarray = {
                MID: paytm_config.MID,
                ORDER_ID: booking.order_id.toString(),
                CUST_ID: user.toString(),
                INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
                CHANNEL_ID: "WAP",
                TXN_AMOUNT: paid_total.toString(),
                WEBSITE: paytm_config.WEBSITE,
                CALLBACK_URL: paytm_config.CALLBACK + 'theia/paytmCallback?ORDER_ID=' + req.query.id,
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
                            if (booking.sub_status != "") {
                                var stage = "In-Process";
                                var status = booking.status;
                            }
                            else {
                                if (booking.date) {
                                    var d1 = booking.date;
                                    var date = new Date();
                                    var d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                    var seconds = (d1.getTime() - d2.getTime()) / 1000;
                                    if (seconds >= 172800) {
                                        var stage = "Booking";
                                        var status = "Confirmed";
                                    }
                                    else {
                                        var stage = "Booking";
                                        var status = "Pending";
                                    }
                                }
                                else {
                                    var stage = "Booking";
                                    var status = "Pending";
                                }
                            }

                            if (booking.due) {
                                if (booking.due.pay) {
                                    var due = booking.due.due - parseFloat(paytmRes.TXNAMOUNT);
                                    if (due > 0) {
                                        var due_info = {
                                            due: Math.ceil(due.toFixed(2)),
                                            pay: 0
                                        }
                                    }
                                    else {
                                        var due_info = null
                                    }
                                }
                            }
                            else {
                                var due_info = null
                            }

                            var data = {
                                status: status,
                                payment: {
                                    estimate_cost: booking.payment.estimate_cost,
                                    careager_cash: booking.payment.careager_cash,
                                    payment_mode: booking.payment.payment_mode,
                                    payment_status: "Success",
                                    discount_type: booking.payment.discount_type,
                                    coupon: booking.payment.coupon,
                                    coupon_type: booking.payment.coupon_type,
                                    discount: booking.payment.discount,
                                    discount_total: booking.payment.discount_total,
                                    discount_applied: booking.payment.discount_applied,
                                    terms: booking.payment.terms,
                                    pick_up_limit: booking.payment.pick_up_limit,
                                    pick_up_charges: booking.payment.pick_up_charges,
                                    labour_cost: booking.payment.labour_cost,
                                    of_cost: booking.payment.of_cost,
                                    part_cost: booking.payment.part_cost,
                                    paid_total: paid_total,
                                    total: booking.payment.total,
                                    policy_clause: booking.payment.policy_clause,
                                    salvage: booking.payment.salvage,
                                    transaction_id: paytmRes.TXNID,
                                    transaction_date: paytmRes.TXNDATE,
                                    transaction_status: paytmRes.STATUS,
                                    transaction_response: paytmRes.RESPMSG
                                },
                                due: due_info,
                                updated_at: new Date()
                            };

                            Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Error Occurred",
                                        responseData: {}
                                    })
                                }
                                else {
                                    var activity = {
                                        user: getUser._id,
                                        name: getUser.name,
                                        stage: stage,
                                        activity: status,
                                    };

                                    fun.bookingLog(booking._id, activity);

                                    fun.transactionLog(booking._id, parseFloat(paytmRes.TXNAMOUNT));
                                    event.zohoLead(booking._id);

                                    booking.services.forEach(async function (service) {
                                        if (service.type == "package") {
                                            var package = await Package.findOne({ _id: service.source }).exec();
                                            var expired_at = new Date();
                                            expired_at.setDate(expired_at.getDate() + package.validity);
                                            var check = await UserPackage.find({ package: service.source, category: "free", user: booking.user, car: booking.car }).count().exec();

                                            if (check <= 0) {

                                                UserPackage.create({
                                                    user: booking.user,
                                                    car: booking.car,
                                                    booking: booking._id,
                                                    name: package.name,
                                                    business: booking.business,
                                                    description: package.description,
                                                    category: package.category,
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
                                                });


                                                if (package.cashback) {
                                                    var point = {
                                                        user: booking.user,
                                                        activity: "coin",
                                                        tag: "cashback",
                                                        source: booking._id,
                                                        sender: null,
                                                        title: "",
                                                        body: "",
                                                        points: package.cashback,
                                                        status: true
                                                    }

                                                    fun.addPoints(point)
                                                }

                                                /*if(booking.is_services==true){
                                                    Booking.update(
                                                        { "_id": booking._id },
                                                        { "$pull": { "services": { "source": service.source } } },
                                                        function(err, numAffected) { 
                                                            if(err){
                                                                // console.log(err);
                                                            } 
                                                        }
                                                    );
                                                }*/
                                            }
                                        }
                                    })

                                    if (booking.package) {
                                        var packageUsed = [];
                                        var package = await UserPackage.findOne({ _id: booking.package, car: booking.car }).exec();
                                        if (package) {
                                            booking.services.forEach(async function (service) {
                                                package.discount.forEach(async function (dis) {
                                                    if (dis.for == "specific") {
                                                        if (dis.label == service.service) {
                                                            if (dis.discount > 0) {
                                                                packageUsed.push({
                                                                    package: booking.package,
                                                                    car: booking.car,
                                                                    user: booking.user,
                                                                    booking: booking._id,
                                                                    for: service.type,
                                                                    label: service.service,
                                                                    created_at: new Date(),
                                                                    updated_at: new Date()
                                                                });
                                                            }
                                                        }
                                                    }
                                                    else if (dis.for == "category") {
                                                        if (dis.label == service.type) {
                                                            packageUsed.push({
                                                                package: booking.package,
                                                                car: booking.car,
                                                                user: booking.user,
                                                                booking: booking._id,
                                                                for: service.type,
                                                                label: service.type,
                                                                created_at: new Date(),
                                                                updated_at: new Date()
                                                            })
                                                        }
                                                    }
                                                });
                                            });

                                            var packageUsed = _.uniqBy(packageUsed, function (o) {
                                                return o.label;
                                            });

                                            packageUsed.forEach(async function (p) {
                                                var checkUsedPackage = await PackageUsed.find({ package: p.package, booking: p.booking, label: p.label, }).count().exec();

                                                if (checkUsedPackage == 0) {
                                                    PackageUsed.create({
                                                        package: p.package,
                                                        car: p.car,
                                                        user: p.user,
                                                        booking: p.booking,
                                                        for: p.for,
                                                        label: p.label,
                                                        created_at: p.created_at,
                                                        updated_at: p.updated_at
                                                    })
                                                }
                                            })
                                        }
                                    }


                                    if (booking.payment.careager_cash > 0) {
                                        var point = {
                                            user: booking.user,
                                            activity: "booking",
                                            tag: "booking",
                                            points: booking.payment.careager_cash,
                                            status: true
                                        }

                                        fun.deductPoints(point);
                                    }


                                    if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
                                        var coupon = await Coupon.findOne({ code: booking.payment.coupon }).exec();
                                        var used = await CouponUsed.findOne({ code: booking.payment.coupon, user: booking.user }).count().exec();
                                        if (used == 0) {
                                            CouponUsed.create({
                                                coupon: coupon._id,
                                                code: coupon.code,
                                                booking: booking._id,
                                                user: booking.user,
                                                created_at: new Date(),
                                                updated_at: new Date()
                                            });

                                            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                                        }
                                    }


                                    if (booking.is_services == true) {
                                        var notify = {
                                            receiver: [booking.business],
                                            activity: "booking",
                                            tag: "newBooking",
                                            source: booking._id,
                                            sender: booking.user,
                                            points: 0
                                        }

                                        fun.newNotification(notify);
                                        event.bookingMail(booking._id);

                                        if (booking.advisor) {
                                            var advisor = await User.findById(booking.advisor).exec();
                                            var notify = {
                                                receiver: [advisor._id],
                                                activity: "booking",
                                                tag: "newBooking",
                                                source: booking._id,
                                                sender: booking.user,
                                                points: 0
                                            }

                                            fun.newNotification(notify);
                                        }

                                        res.status(200).json({
                                            responseCode: 200,
                                            responseMessage: "Payment Done",
                                            responseData: paytmRes
                                        });
                                    }
                                    else {
                                        var notify = {
                                            receiver: [booking.business],
                                            activity: "package",
                                            tag: "newPackage",
                                            source: booking._id,
                                            sender: booking.user,
                                            points: 0
                                        }

                                        fun.newNotification(notify);
                                        event.bookingMail(booking._id);

                                        res.status(200).json({
                                            responseCode: 200,
                                            responseMessage: "Package successfully purchased, Book Services Now for added benefits",
                                            responseData: paytmRes
                                        });
                                    }
                                }
                            });
                        }
                        else {
                            var data = {
                                payment: {
                                    estimate_cost: booking.payment.estimate_cost,
                                    careager_cash: booking.payment.careager_cash,
                                    payment_mode: booking.payment.payment_mode,
                                    payment_status: "Failure",
                                    discount_type: booking.payment.discount_type,
                                    coupon: booking.payment.coupon,
                                    coupon_type: booking.payment.coupon_type,
                                    discount: booking.payment.discount,
                                    terms: booking.payment.terms,
                                    pick_up_limit: booking.payment.pick_up_limit,
                                    pick_up_charges: booking.payment.pick_up_charges,
                                    discount_total: booking.payment.discount_total,
                                    labour_cost: booking.payment.labour_cost,
                                    of_cost: booking.payment.of_cost,
                                    part_cost: booking.payment.part_cost,
                                    paid_total: booking.payment.paid_total,
                                    total: booking.payment.total,
                                    discount_applied: booking.payment.discount_applied,
                                    policy_clause: booking.payment.policy_clause,
                                    salvage: booking.payment.salvage,
                                    transaction_id: paytmRes.TXNID,
                                    transaction_date: paytmRes.TXNDATE,
                                    transaction_status: paytmRes.STATUS,
                                    transaction_response: paytmRes.RESPMSG,
                                    transaction_response: paytmRes.TXNAMOUNT
                                },
                                due: {
                                    due: booking.payment.part_cost + booking.payment.labour_cost + booking.payment.of_cost + booking.payment.salvage + booking.payment.pick_up_charges + booking.payment.policy_clause - booking.payment.careager_cash
                                },
                                updated_at: new Date()
                            }


                            Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                                fun.transactionLog(booking._id, parseFloat(paytmRes.TXNAMOUNT));
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Error Occurred",
                                        responseData: {}
                                    })
                                }

                                if (booking.payment.discount_applied == false) {
                                    if (booking.payment.discount_type == "coins") {
                                        var getCoins = await User.findById(booking.user).select('careager_cash').exec();
                                        var remain = getCoins.careager_cash - booking.payment.discount;

                                        if (booking.payment.discount > 0) {
                                            var point = {
                                                status: true,
                                                user: booking.user,
                                                activity: "booking",
                                                tag: "usedInBooking",
                                                points: booking.payment.discount,
                                                source: booking._id,
                                                created_at: new Date(),
                                                updated_at: new Date(),
                                                type: "debit",
                                            };

                                            Point.create(point).then(async function (point) {
                                                User.findOneAndUpdate({ _id: booking.user }, { $set: { careager_cash: remain } }, { new: false }, async function (err, doc) { });

                                                Booking.findOneAndUpdate({ _id: booking._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                                            })
                                        }
                                    }

                                    else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
                                        var coupon = await Coupon.findOne({ code: booking.payment.coupon }).exec();
                                        var used = await CouponUsed.findOne({ code: booking.payment.coupon, user: booking.user }).count().exec();
                                        if (used == 0) {
                                            CouponUsed.create({
                                                coupon: coupon._id,
                                                code: coupon.code,
                                                booking: booking._id,
                                                user: booking.user,
                                                created_at: new Date(),
                                                updated_at: new Date()
                                            });

                                            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                                        }
                                    }
                                }
                                event.zohoLead(booking._id);
                            });

                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Your transaction has been declined",
                                responseData: paytmRes
                            })
                        }
                    }
                });
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
            responseMessage: "Booking not found",
            responseData: {}
        });
    }
});

router.get('/booking/payment/logs', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var booking = await Booking.findById(req.query.booking).exec();
    if (booking) {
        var logs = [];
        await TransactionLog.find({ source: req.query.booking })
            .sort({ updated_at: -1 })
            .cursor().eachAsync(async (log) => {
                logs.push({
                    _id: log._id,
                    id: log._id,
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
            responseMessage: "Booking not found",
            responseData: {}
        });
    }
});

router.post('/payment/gateway/response', xAccessToken.token, async function (req, res, next) {
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

        if (booking) {
            var transaction = await TransactionLog.findOne({ source: booking._id }).sort({ created_at: -1 }).exec()
            if (booking.payment.payment_status == "Success" || booking.payment.payment_status == "success") {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Payment Done",
                    responseData: {
                        booking_no: booking.booking_no,
                        payment: transaction,
                        is_services: booking.is_services
                    }
                });
            }
            else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Payment Failure",
                    responseData: {
                        booking_no: booking.booking_no,
                        payment: transaction,
                        is_services: booking.is_services
                    }
                });
            }
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

router.post('/payment/gateway/tampering', xAccessToken.token, async function (req, res, next) {
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
        var booking = await Booking.findOne({ _id: req.body.id }).exec();

        if (booking) {

            var data = {
                status: "Failure",
                payment: {
                    payment_mode: booking.payment.payment_mode,
                    payment_status: req.body.order_status,
                    discount_type: booking.payment.discount_type,
                    coupon: booking.payment.coupon,
                    coupon_type: booking.payment.coupon_type,
                    terms: booking.payment.terms,
                    pick_up_limit: booking.payment.pick_up_limit,
                    pick_up_charges: booking.payment.pick_up_charges,
                    discount: booking.payment.discount,
                    discount_total: booking.payment.discount_total,
                    labour_cost: booking.payment.labour_cost,
                    part_cost: booking.payment.part_cost,
                    paid_total: 0,
                    //paid_total: booking.payment.paid_total,
                    total: booking.payment.total,
                    discount_applied: booking.payment.discount_applied,
                    transaction_id: req.body.bank_ref_no,
                    transaction_date: booking.payment.transaction_date,
                    transaction_status: req.body.order_status,
                    transaction_response: req.body.status_message
                },
                due: booking.due
            }

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                fun.transactionLog(booking._id, req.body.amount);
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occurred",
                        responseData: {}
                    })
                }

                if (booking.payment.discount_applied == false) {
                    if (booking.payment.discount_type == "coins") {
                        var getCoins = await User.findById(booking.user).select('careager_cash').exec();
                        var remain = getCoins.careager_cash - booking.payment.discount;

                        if (booking.payment.discount > 0) {
                            var point = {
                                status: true,
                                user: booking.user,
                                activity: "booking",
                                tag: "usedInBooking",
                                points: booking.payment.discount,
                                source: booking._id,
                                created_at: new Date(),
                                updated_at: new Date(),
                                type: "debit",
                            };

                            Point.create(point).then(async function (point) {
                                User.findOneAndUpdate({ _id: booking.user }, { $set: { careager_cash: remain } }, { new: false }, async function (err, doc) { });

                                Booking.findOneAndUpdate({ _id: booking._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                            })
                        }
                    }

                    else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
                        var coupon = await Coupon.findOne({ code: booking.payment.coupon }).exec();
                        var used = await CouponUsed.findOne({ code: booking.payment.coupon, user: booking.user }).count().exec();
                        if (used == 0) {
                            CouponUsed.create({
                                coupon: coupon._id,
                                code: coupon.code,
                                booking: booking._id,
                                user: booking.user,
                                created_at: new Date(),
                                updated_at: new Date()
                            });

                            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                        }
                    }

                    var checkPackage = UserPackage.findOne({ booking: booking.id }).exec();
                    if (checkPackage) {
                        UserPackage.findOneAndUpdate({ booking: booking._id }, { $set: { "status": false, updated_at: new Date() } }, { new: false }, async function (err, doc) { })
                    }

                }

                //event.zohoLead(booking._id); 
            });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Your transaction has been declined",
                responseData: req.body
            })

        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: req.body
            })
        }
    }
});

router.post('/payu/success', async function (req, res, next) {
    var booking = await Booking.findOne({ booking_no: parseInt(req.body.productinfo) }).exec();

    if (booking) {
        if (req.body.status == "success") {
            /*if(booking.payment.payment_status=="Pending")
            {*/

            var d1 = booking.date;
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

            if (booking.due) {

                var paid_total = booking.payment.paid_total + booking.due.due;
                var total = booking.payment.total + booking.due.due;
                var part_cost = booking.payment.part_cost + booking.due.part_cost;
                var labour_cost = booking.payment.labour_cost + booking.due.labour_cost;

                var transaction = req.body.amount;
            }
            else {
                var paid_total = booking.payment.paid_total;
                var total = booking.payment.total;
                var part_cost = booking.payment.part_cost;
                var labour_cost = booking.payment.labour_cost;

                var transaction = req.body.amount;
            }

            var data = {
                status: status,
                payment: {
                    payment_mode: booking.payment.payment_mode,
                    payment_status: req.body.status,
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
                    transaction_id: req.body.txnid,
                    transaction_date: req.body.addedon,
                    transaction_status: req.body.status,
                    transaction_response: booking.payment.transaction_response
                },
                due: {
                    due: 0
                },
                updated_at: new Date()
            };

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {

                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occurred",
                        responseData: {}
                    })
                }
                else {
                    fun.transactionLog(booking._id, booking.payment.paid_total);
                    event.zohoLead(booking._id);

                    booking.services.forEach(async function (service) {
                        if (service.type == "package") {
                            var package = await Package.findOne({ _id: service.source }).exec();
                            var expired_at = new Date();
                            expired_at.setDate(expired_at.getDate() + package.validity);
                            var check = await UserPackage.find({ package: service.source, category: "free", user: booking.user, car: booking.car }).count().exec();

                            if (check <= 0) {
                                UserPackage.create({
                                    user: booking.user,
                                    car: booking.car,
                                    name: package.name,
                                    booking: booking._id,
                                    business: booking.business,
                                    description: package.description,
                                    category: package.category,
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
                                });

                                if (booking.is_services == true) {
                                    Booking.update(
                                        { "_id": booking._id },
                                        { "$pull": { "services": { "source": service.source } } },
                                        function (err, numAffected) {
                                            if (err) {
                                                // console.log(err);
                                            }
                                        }
                                    );
                                }
                            }
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
                                                user: booking.user,
                                                booking: booking._id,
                                                for: service.type,
                                                label: service.service,
                                                created_at: new Date(),
                                                updated_at: new Date()
                                            });
                                        }
                                    }

                                    else if (dis.for == "category") {
                                        if (dis.label == service.type) {
                                            var cpu = await PackageUsed.find({ package: booking.package, booking: booking._id }).count().exec();
                                            // console.log(cpu)
                                            if (cpu == 0) {
                                                PackageUsed.create({
                                                    package: booking.package,
                                                    car: booking.car,
                                                    user: booking.user,
                                                    booking: booking._id,
                                                    for: service.type,
                                                    label: service.service,
                                                    created_at: new Date(),
                                                    updated_at: new Date()
                                                });
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    }

                    if (booking.payment.discount_type == "coins") {
                        var getCoins = await User.findById(booking.user).select('careager_cash').exec();
                        var remain = getCoins.careager_cash - booking.payment.discount;

                        if (booking.payment.discount > 0) {
                            var point = {
                                status: true,
                                user: booking.user,
                                activity: "booking",
                                tag: "usedInBooking",
                                points: booking.payment.discount,
                                source: booking._id,
                                created_at: new Date(),
                                updated_at: new Date(),
                                type: "debit",
                            };

                            Point.create(point).then(async function (point) {
                                User.findOneAndUpdate({ _id: booking.user }, { $set: { careager_cash: remain } }, { new: false }, async function (err, doc) { });
                            })
                        }
                    }

                    else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
                        var coupon = await Coupon.findOne({ code: booking.payment.coupon }).exec();

                        CouponUsed.create({
                            coupon: coupon._id,
                            code: coupon.code,
                            booking: booking._id,
                            user: booking.user,
                            created_at: new Date(),
                            updated_at: new Date()
                        });
                    }


                    if (booking.is_services == true) {
                        var notify = {
                            receiver: [booking.business],
                            activity: "booking",
                            tag: "newBooking",
                            source: booking._id,
                            sender: booking.user,
                            points: 0
                        }

                        fun.newNotification(notify);
                        event.bookingMail(booking._id);

                        if (booking.advisor) {
                            var advisor = await User.findById(booking.advisor).exec();
                            var notify = {
                                receiver: [advisor._id],
                                activity: "booking",
                                tag: "newBooking",
                                source: booking._id,
                                sender: booking.user,
                                points: 0
                            }

                            fun.newNotification(notify);
                            //event.bookingMailAdvisor(booking._id);   
                        }


                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Service has been booked",
                            responseData: {
                                booking_no: booking.booking_no,
                                is_services: booking.is_services
                            }
                        });
                    }
                    else {
                        var notify = {
                            receiver: [booking.business],
                            activity: "package",
                            tag: "newPackage",
                            source: booking._id,
                            sender: booking.user,
                            points: 0
                        }

                        fun.newNotification(notify);
                        event.bookingMail(booking._id);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Package successfully purchased, Book Services Now for added benefits",
                            responseData: {
                                booking_no: booking.booking_no,
                                is_services: booking.is_services
                            }
                        });
                    }
                }
            });
        }
        else {
            var data = {
                status: booking.status,
                payment: {
                    payment_mode: booking.payment.payment_mode,
                    payment_status: req.body.status,
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
                    transaction_id: req.body.txnid,
                    transaction_date: req.body.addedon,
                    transaction_status: req.body.status,
                    transaction_response: booking.payment.transaction_response
                }
            };

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                fun.transactionLog(booking._id, booking.payment.paid_total);
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occurred",
                        responseData: {}
                    })
                }
                event.zohoLead(booking._id);
            });

            res.status(400).json({
                responseCode: 400,
                responseMessage: "Payment Failed",
                responseData: req.body
            })
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking not found",
            responseData: req.body
        })
    }
});

router.post('/payu/failure', async function (req, res, next) {
    var booking = await Booking.findOne({ booking_no: parseInt(req.body.productinfo) }).exec();
    if (booking) {
        var data = {
            status: booking.status,
            payment: {
                payment_mode: booking.payment.payment_mode,
                payment_status: req.body.status,
                discount_type: booking.payment.discount_type,
                coupon: booking.payment.coupon,
                coupon_type: booking.payment.coupon_type,
                discount: booking.payment.discount,
                terms: booking.payment.terms,
                pick_up_limit: booking.payment.pick_up_limit,
                pick_up_charges: booking.payment.pick_up_charges,
                discount_total: booking.payment.discount_total,
                labour_cost: booking.payment.labour_cost,
                part_cost: booking.payment.part_cost,
                paid_total: booking.payment.paid_total,
                total: booking.payment.total,
                discount_applied: booking.payment.discount_applied,
                transaction_id: req.body.txnid,
                transaction_date: req.body.addedon,
                transaction_status: req.body.status,
                transaction_response: booking.payment.transaction_response
            }
        };

        Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
            fun.transactionLog(booking._id, booking.payment.paid_total);
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Error Occurred",
                    responseData: {}
                })
            }
            event.zohoLead(booking._id);
        });

        res.status(422).json({
            responseCode: 422,
            responseMessage: "Payment Failed",
            responseData: req.body
        })
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking Not Found",
            responseData: req.body
        })
    }
});

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
        var cpu = 0;
        if (booking) {

            if (booking.due != null) {
                var paid_total = booking.payment.paid_total + booking.due.due;

            }
            else {
                var paid_total = booking.payment.paid_total;
            }


            var d1 = booking.date;

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
                status: status,
                payment: {
                    payment_mode: booking.payment.payment_mode,
                    payment_status: "Success",
                    discount_type: booking.payment.discount_type,
                    coupon: booking.payment.coupon,
                    coupon_type: booking.payment.coupon_type,
                    discount: booking.payment.discount,
                    terms: booking.payment.terms,
                    discount_total: booking.payment.discount_total,
                    pick_up_limit: booking.payment.pick_up_limit,
                    pick_up_charges: booking.payment.pick_up_charges,
                    labour_cost: Math.ceil(booking.payment.labour_cost),
                    part_cost: Math.ceil(booking.payment.part_cost),
                    paid_total: Math.ceil(booking.payment.paid_total),
                    total: Math.ceil(booking.payment.total),
                    discount_applied: booking.payment.discount_applied,
                    transaction_id: booking.payment.transaction_id,
                    transaction_date: booking.payment.transaction_date,
                    transaction_status: booking.payment.transaction_status,
                    transaction_response: booking.payment.transaction_response
                }
            };

            Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
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
                            var check = await UserPackage.find({ package: service.source, category: "free", user: user, car: booking.car }).count().exec();

                            if (check <= 0) {
                                UserPackage.create({
                                    user: user,
                                    car: booking.car,
                                    name: package.name,
                                    booking: booking._id,
                                    business: booking.business,
                                    description: package.description,
                                    category: package.category,
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
                                });

                                if (booking.is_services == true) {
                                    Booking.update(
                                        { "_id": booking._id },
                                        { "$pull": { "services": { "source": service.source } } },
                                        function (err, numAffected) {
                                            if (err) {
                                                // console.log(err);
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    })

                    if (booking.package) {
                        var packageUsed = [];
                        var package = await UserPackage.findOne({ _id: booking.package, car: booking.car }).exec();
                        if (package) {
                            booking.services.forEach(async function (service) {
                                package.discount.forEach(async function (dis) {

                                    if (dis.for == "specific") {
                                        if (dis.label == service.service) {
                                            if (dis.discount > 0) {
                                                packageUsed.push({
                                                    source: service.source,
                                                    package: booking.package,
                                                    car: booking.car,
                                                    user: booking.user,
                                                    booking: booking._id,
                                                    for: service.type,
                                                    label: service.service,
                                                    created_at: new Date(),
                                                    updated_at: new Date()
                                                });
                                            }
                                        }
                                    }

                                    else if (dis.for == "category") {
                                        if (dis.label == service.type) {
                                            if (dis.discount > 0) {
                                                packageUsed.forEach(async function (c) {
                                                    if (c.source != service.source) {
                                                        packageUsed.push({
                                                            source: service.source,
                                                            package: booking.package,
                                                            car: booking.car,
                                                            user: booking.user,
                                                            booking: booking._id,
                                                            for: service.type,
                                                            label: service.type,
                                                            created_at: new Date(),
                                                            updated_at: new Date()
                                                        })
                                                    }
                                                })
                                            }
                                        }
                                    }
                                });
                            });

                            var packageUsed = _.uniqBy(packageUsed, function (o) {
                                return o.label;
                            });

                            // console.log(packageUsed)

                            packageUsed.forEach(async function (p) {
                                var check = await PackageUsed.find({ package: p.package, car: p.car, user: p.user, booking: p.booking, label: p.label }).count().exec();
                                if (check == 0) {
                                    PackageUsed.create({
                                        package: p.package,
                                        car: p.car,
                                        user: p.user,
                                        booking: p.booking,
                                        for: p.for,
                                        label: p.label,
                                        created_at: p.created_at,
                                        updated_at: p.updated_at
                                    })
                                }
                            })
                        }
                    }


                    if (booking.payment.discount_type == "coins") {
                        var getCoins = await User.findById(user).select('careager_cash').exec();
                        var remain = getCoins.careager_cash - booking.payment.discount;
                        if (booking.payment.discount > 0) {
                            var point = {
                                status: true,
                                user: user,
                                activity: "coin",
                                tag: "usedInBooking",
                                points: booking.payment.discount,
                                source: booking._id,
                                created_at: new Date(),
                                updated_at: new Date(),
                                type: "debit",
                            };

                            Point.create(point).then(async function (point) {
                                User.findOneAndUpdate({ _id: user }, { $set: { careager_cash: remain } }, { new: false }, async function (err, doc) { });
                            })
                        }
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


                    if (booking.is_services == true) {
                        var notify = {
                            receiver: [booking.business],
                            activity: "booking",
                            tag: "newBooking",
                            source: booking._id,
                            sender: user,
                            points: 0
                        }

                        fun.newNotification(notify);
                        event.bookingMail(booking._id);

                        if (booking.advisor) {
                            var advisor = await User.findById(booking.advisor).exec();
                            var notify = {
                                receiver: [advisor._id],
                                activity: "booking",
                                tag: "newBooking",
                                source: booking._id,
                                sender: user,
                                points: 0
                            }

                            fun.newNotification(notify);
                        }

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Service has been booked",
                            responseData: {
                                booking_no: booking.booking_no,
                                is_services: booking.is_services
                            }
                        });
                    }
                    else {
                        var notify = {
                            receiver: [booking.business],
                            activity: "package",
                            tag: "newPackage",
                            source: booking._id,
                            sender: user,
                            points: 0
                        }

                        fun.newNotification(notify);
                        event.bookingMail(booking._id);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Package successfully purchased, Book Services Now for added benefits",
                            responseData: {
                                booking_no: booking.booking_no,
                                is_services: booking.is_services
                            }
                        });
                    }
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

router.post('/pay/later', xAccessToken.token, async function (req, res, next) {
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
        var loggedInDetails = await User.findById(user).exec();
        var booking = await Booking.findById(req.body.id).exec();
        var coupon = await Coupon.findOne({ code: req.body.coupon }).exec();

        if (booking) {
            var package = _.filter(booking.services, type => type.type == "package");
            if (Object.keys(package).length <= 0) {
                var d1 = booking.date;
                var date = new Date();
                var d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                var seconds = (d1.getTime() - d2.getTime()) / 1000;
                if (seconds >= 172800) {
                    var status = "Confirmed"
                }
                else {
                    var status = "Pending"
                }

                var data = {
                    status: status,
                    updated_at: new Date()
                }

                Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: {}
                        })
                    }
                    else {
                        User.findOneAndUpdate({ _id: booking.user }, {
                            $push: {
                                "bookings": booking._id
                            }
                        }, { new: true }, async function (err, doc) {
                            if (err) {
                                // console.log(err)
                            }
                            else {
                                // console.log(doc)
                            }
                        });


                        var activity = {
                            user: loggedInDetails._id,
                            name: loggedInDetails.name,
                            stage: "Booking",
                            activity: status,
                        }

                        fun.bookingLog(booking._id, activity);

                        booking.services.forEach(async function (service) {
                            if (service.type == "package") {
                                var package = await Package.findOne({ _id: service.source }).exec();
                                var expired_at = new Date();
                                expired_at.setDate(expired_at.getDate() + package.validity);
                                var check = await UserPackage.find({ package: service.source, category: "free", user: user, car: booking.car }).count().exec();

                                if (check <= 0) {
                                    UserPackage.create({
                                        user: user,
                                        car: booking.car,
                                        name: package.name,
                                        booking: booking._id,
                                        business: booking.business,
                                        description: package.description,
                                        category: package.category,
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
                                    });

                                    if (booking.is_services == true) {
                                        Booking.update(
                                            { "_id": booking._id },
                                            { "$pull": { "services": { "source": service.source } } },
                                            function (err, numAffected) {
                                                if (err) {
                                                    // console.log(err);
                                                }
                                            }
                                        );
                                    }
                                }
                            }
                        })

                        if (booking.package) {
                            var packageUsed = [];
                            var package = await UserPackage.findOne({ _id: booking.package, car: booking.car }).exec();
                            if (package) {
                                booking.services.forEach(async function (service) {
                                    package.discount.forEach(async function (dis) {

                                        if (dis.for == "specific") {
                                            if (dis.label == service.service) {
                                                if (dis.discount > 0) {
                                                    packageUsed.push({
                                                        source: service.source,
                                                        package: booking.package,
                                                        car: booking.car,
                                                        user: booking.user,
                                                        booking: booking._id,
                                                        for: service.type,
                                                        label: service.service,
                                                        created_at: new Date(),
                                                        updated_at: new Date()
                                                    });
                                                }
                                            }
                                        }

                                        else if (dis.for == "category") {
                                            if (dis.label == service.type) {
                                                if (dis.discount > 0) {
                                                    packageUsed.forEach(async function (c) {
                                                        if (c.source != service.source) {
                                                            packageUsed.push({
                                                                source: service.source,
                                                                package: booking.package,
                                                                car: booking.car,
                                                                user: booking.user,
                                                                booking: booking._id,
                                                                for: service.type,
                                                                label: service.type,
                                                                created_at: new Date(),
                                                                updated_at: new Date()
                                                            })
                                                        }
                                                    })
                                                }
                                            }
                                        }
                                    });
                                });

                                var packageUsed = _.uniqBy(packageUsed, function (o) {
                                    return o.label;
                                });

                                // console.log(packageUsed)

                                packageUsed.forEach(async function (p) {
                                    var check = await PackageUsed.find({ package: p.package, car: p.car, user: p.user, booking: p.booking, label: p.label }).count().exec();
                                    if (check == 0) {
                                        PackageUsed.create({
                                            package: p.package,
                                            car: p.car,
                                            user: p.user,
                                            booking: p.booking,
                                            for: p.for,
                                            label: p.label,
                                            created_at: p.created_at,
                                            updated_at: p.updated_at
                                        })
                                    }
                                })
                            }
                        }

                        if (booking.payment.careager_cash > 0) {
                            var point = {
                                user: booking.user,
                                activity: "booking",
                                tag: "booking",
                                points: booking.payment.careager_cash,
                                status: true
                            }

                            fun.deductPoints(point);
                        }

                        if (booking.payment.coupon != "") {
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

                        if (booking.is_services == true) {
                            var notify = {
                                receiver: [booking.business],
                                activity: "booking",
                                tag: "newBooking",
                                source: booking._id,
                                sender: user,
                                points: 0
                            }

                            fun.newNotification(notify);
                            event.bookingMail(booking._id);

                            if (booking.advisor) {
                                var advisor = await User.findById(booking.advisor).exec();
                                var notify = {
                                    receiver: [advisor._id],
                                    activity: "booking",
                                    tag: "newBooking",
                                    source: booking._id,
                                    sender: user,
                                    points: 0
                                }

                                fun.newNotification(notify);
                            }

                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Service has been booked",
                                responseData: {
                                    booking_no: booking.booking_no,
                                    is_services: booking.is_services
                                }
                            });
                        }
                        else {
                            var notify = {
                                receiver: [booking.business],
                                activity: "package",
                                tag: "newPackage",
                                source: booking._id,
                                sender: user,
                                points: 0
                            }

                            fun.newNotification(notify);
                            event.bookingMail(booking._id);

                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Package successfully purchased, Book Services Now for added benefits",
                                responseData: {
                                    booking_no: booking.booking_no,
                                    is_services: booking.is_services
                                }
                            });
                        }
                    }
                });
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "'Pay Later' is not applicable for packages.",
                    responseData: {}
                })
            }
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

router.get('/payment/failure', xAccessToken.token, async function (req, res, next) {
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Payment Failure",
        responseData: {}
    });
});

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
            list: group
        }
    });
});

router.get('/referrals/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    var referrals = [];
    var total = 0, used = 0;
    await Referral.find({ owner: user }).populate('user').sort({ created_at: -1 }).cursor().eachAsync(async (referral) => {
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
                    });
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
                });
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

router.post('/review/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        business: 'required',
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
                var b = null
                var check = await Review.find({ user: user, business: req.body.business, type: "profile" }).count().exec();
                if (check > 0) {
                    await Review.remove({ user: user, business: req.body.business, type: "profile" }).exec();
                }
            }
            else {
                var r = await Review.findOne({ booking: req.body.booking }).exec();
                if (r) {
                    return res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Review has been already taken",
                        responseData: {}
                    });
                }
                else {
                    var b = req.body.booking;
                }
            }


            req.body.booking = b;
            req.body.status = false;
            req.body.user = user;
            req.body.created_at = new Date();
            req.body.updated_at = new Date();

            var source = user;

            await Review.create(req.body).then(async function (data) {
                if (data.type == "service") {
                    var booking = await Booking.findOne({ _id: req.body.booking }).exec();

                    if (data.rating >= 4) {
                        event.zohoCustomStatus(booking._id, "Satisfied");
                    }
                    else {
                        var date = data.updated_at;
                        date.setDate(date.getDate())
                        var newdate = moment(date).format("YYYY-MM-DD");

                        var lead = {
                            psf: true,
                            updated_at: new Date(),
                            remark: {
                                lead: booking.lead,
                                assignee: booking.manager,
                                status: "PSF",
                                reason: "Dissatisfied",
                                assignee_remark: "Customer Dissatisfied :" + data.review,
                                customer_remark: "Customer Dissatisfied :" + data.review,
                                color_code: "",
                                created_at: new Date(),
                                updated_at: new Date()
                            },
                            follow_up: {
                                date: new Date(newdate.toString()),
                                created_at: new Date(),
                                updated_at: new Date(),
                            }
                        };

                        // console.log(lead)

                        Lead.findOneAndUpdate({ _id: booking.lead }, { $set: lead }, { new: true }, async function (err, doc) {
                            LeadRemark.create(lead.remark).then(function (newRemark) {
                                Lead.findOneAndUpdate({ _id: booking.lead }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                                })
                            });
                        });
                    }


                    var point = {
                        user: user,
                        activity: "coin",
                        tag: "businessReview",
                        source: booking._id,
                        points: 25,
                        title: "",
                        body: "",
                        status: true
                    }
                    fun.addPoints(point);


                    Booking.findOneAndUpdate({ _id: booking._id }, { $set: { is_reviewed: true, updated_at: data.updated_at } }, { new: false }, async function (err, doc) { });

                    if (booking.advisor) {
                        var notify = {
                            receiver: [booking.advisor],
                            sender: data.user,
                            activity: "profile",
                            tag: "review",
                            source: booking._id,
                            points: data.rating,
                        }

                        fun.newNotification(notify);
                    }

                    if (booking.manager) {
                        var notify = {
                            receiver: [booking.manager],
                            sender: data.user,
                            activity: "profile",
                            tag: "review",
                            source: booking._id,
                            points: data.rating,
                        }
                        fun.newNotification(notify);
                    }

                    source = booking._id
                }


                var notify = {
                    receiver: [data.business],
                    sender: data.user,
                    activity: "profile",
                    tag: "review",
                    source: source,
                    points: data.rating,
                }

                fun.newNotification(notify);
                /*else{
                    var point = {
                        user:user,
                        activity:"coin",
                        tag:"businessReview",
                        source: req.body.business,
                        points:25,
                        status:true
                    }
                    fun.addPoints(point);
                }*/





                await Review.find({ _id: data._id })
                    .populate({ path: 'user', select: 'name username avatar avatar_address account_info' })
                    .cursor().eachAsync(async (review) => {

                        businessReview = {
                            _id: review._id,
                            id: review._id,
                            business: review.business,
                            booking: review.booking,
                            review_points: review.review_points,
                            rating: review.rating,
                            review: review.review,
                            type: review.type,
                            created_at: moment(review.created_at).tz(req.headers['tz']).format('ll'),
                            updated_at: moment(review.updated_at).tz(req.headers['tz']).format('ll'),
                            user: review.user
                        }
                    });

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Thank You For Your Review",
                    responseData: businessReview
                });
            })
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
                    activity: "coin",
                    tag: "modelReview",
                    points: 25,
                    title: "",
                    body: "",
                    status: true
                }

                fun.addPoints(point);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Thank You For Your Review",
                    responseData: info
                });
            });
        }
    }
});

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

    var user = await User.findOne({ _id: decoded.user }).exec();

    if (user) {
        var checkLead = await Lead.findOne({ contact_no: user.contact_no, "remark.status": { $in: ["Open", "Follow-Up", "Assigned"] } }).sort({ updated_at: -1 }).exec();

        var status = await LeadStatus.findOne({ status: "Open" }).exec();

        if (checkLead) {
            Lead.findOneAndUpdate({ _id: checkLead._id }, {
                $set: {
                    user: user._id,
                    name: user.name,
                    contact_no: user.contact_no,
                    email: user.email,
                    priority: 3,
                    contacted: false,
                    type: "Claim Intimation",
                    follow_up: {
                        date: null,
                        time: "",
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    geometry: [req.body.longitude, req.body.latitude],
                    remark: {
                        status: status.status,
                        customer_remark: "Claim Intimation",
                        assignee_remark: "Claim Intimation",
                        color_code: status.color_code,
                        created_at: new Date(),
                        updated_at: new Date()
                    },
                    source: "Claim Intimation",
                    updated_at: new Date()
                }
            }, { new: true }, async function (err, doc) {

                LeadRemark.create({
                    lead: checkLead._id,
                    type: "Claim Intimation",
                    source: "Claim Intimation",
                    status: status.status,
                    customer_remark: "Claim Intimation",
                    assignee_remark: "Claim Intimation",
                    assignee: checkLead.assignee,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                }).then(function (newRemark) {
                    Lead.findOneAndUpdate({ _id: checkLeads._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                    })
                });


                event.assistance(checkLead, req.headers['tz'])

                var json = ({
                    responseCode: 200,
                    responseMessage: "Location details are shared with our Claim Intimation Team. You'll be contacted as soon as possible. Alternatively, you can also call us at 1800 843 4300",
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
            await LeadManagement.find({ business: "5bfec47ef651033d1c99fbca", source: "Claim Intimation" })
                .cursor().eachAsync(async (a) => {
                    var d = await Lead.find({ business: "5bfec47ef651033d1c99fbca", assignee: a.user }).count().exec();
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
                type: "Claim Intimation",
                geometry: [req.body.longitude, req.body.latitude],
                source: "Claim Intimation",
                remark: {
                    status: status.status,
                    customer_remark: "Claim Intimation",
                    assignee_remark: "Claim Intimation",
                    assignee: manager,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                created_at: new Date(),
                updated_at: new Date(),
            }

            Lead.create(data).then(async function (lead) {
                var count = await Lead.find({ _id: { $lt: l._id }, business: "5bfec47ef651033d1c99fbca" }).count();
                var lead_id = count + 10000;

                Lead.findOneAndUpdate({ _id: l._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
                })
                var status = await LeadStatus.findOne({ status: "Open" }).exec();
                LeadRemark.create({
                    lead: lead._id,
                    type: "Claim Intimation",
                    source: "Claim Intimation",
                    status: status.status,
                    customer_remark: "Claim Intimation",
                    assignee_remark: "Claim Intimation",
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
                    responseMessage: "Location details are shared with our Claim Intimation Team. You'll be contacted as soon as possible. Alternatively, you can also call us at 1800 843 4300",
                    responseData: {}
                });

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

router.get('/purchased/packages/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var packages = [];

    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

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
                    created_at: moment(package.updated_at).tz(req.headers['tz']).format('lll'),
                    expired_at: moment(e).tz(req.headers['tz']).format('lll'),
                });

                // console.log(packages)
            }
        })

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Packages",
        responseData: packages
    })
});

router.get('/product/category/get', xAccessToken.token, async function (req, res, next) {
    const result = []
    await ProductCategory.find({ parent_id: null, is_show: true })
        .cursor().eachAsync(async (v) => {
            var subcategory = null
            if (v.children) {
                var subcategory = await ProductCategory.find({ parent_id: v._id, is_show: true }).exec()
            }
            result.push({
                _id: v._id,
                id: v.id,
                icon: v.icon,
                category: v.category,
                children: v.children,
                subcategory: subcategory,
            })
        });
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result
    });
});

router.get('/product/subcategory/get', xAccessToken.token, async function (req, res, next) {
    const productCategories = await ProductCategory.find({ parent_id: req.query.id }).exec();
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: productCategories,
    });
});

router.get('/product/brands/get', xAccessToken.token, async function (req, res, next) {
    if (req.query.by == "category") {
        var data = await ProductBrand.find({ category: req.query.query }).exec();
    }
    else if (req.query.by == "tag") {
        var data = await ProductBrand.find({ tag: req.query.query }).exec();
    }
    else if (req.query.by == "id") {
        var data = await ProductBrand.findOne({ _id: req.query.query }).exec();
    }
    else {
        var data = await ProductBrand.find({}).exec();
    }
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: data
    });
});

router.get('/product/models/get', xAccessToken.token, async function (req, res, next) {
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
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: await ProductModel.find({ brand: req.query.id }).exec(),
        });
    }
});

router.get('/products/master/get', xAccessToken.token, async function (req, res, next) {
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
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: await Product.find({ product_model: req.query.id }).exec(),
        });
    }
});

router.get('/products/filters/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var result = [];
    var key = req.query.query;
    var productFilter = await ProductFilter.findOne({ category: req.query.query }).exec();
    if (productFilter) {
        return client.get('filter-' + productFilter.category, async (err, cacheData) => {
            if (cacheData) {
                const resultJSON = JSON.parse(cacheData);
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "[c]",
                    responseData: resultJSON,
                });
            }
            else {
                var keys = productFilter.filters;
                for (var i = 0; i < keys.length; i++) {

                    if (keys[i] == "ProductBrand") {
                        await BusinessProduct.findOne({ subcategory: req.query.query, })
                            .cursor().eachAsync(async (v) => {
                                result.push({
                                    _id: v.product_brand,
                                    id: v.product_brand,
                                    filter: v._product_brand,
                                    type: "Brand",
                                    key: "brand",
                                });
                            });

                        result = _.uniqBy(result, 'filter');
                    }

                    else if (keys[i] == "Price") {
                        var v = await BusinessProduct.findOne({ subcategory: req.query.query }).sort({ "price.sell_price": 1 }).exec()
                        result.push({
                            _id: v._id,
                            id: v._id,
                            filter: v.price.sell_price,
                            type: "Price",
                            key: "price",
                        });

                        var v = await BusinessProduct.findOne({ subcategory: req.query.query }).sort({ "price.sell_price": -1 }).exec()
                        result.push({
                            _id: v._id,
                            id: v._id,
                            filter: v.price.sell_price,
                            type: "Price",
                            key: "price",
                        });
                    }

                    else if (keys[i] == "Size") {
                        await BusinessProduct.findOne({ subcategory: req.query.query, })
                            .cursor().eachAsync(async (v) => {
                                result.push({
                                    _id: v._id,
                                    id: v._id,
                                    filter: v.specification.size,
                                    type: "Size",
                                    key: "size",
                                });
                            });

                        result = _.uniqBy(result, 'filter');
                    }

                    else if (keys[i] == "Specification") {
                        await BusinessProduct.findOne({ subcategory: req.query.query, })
                            .cursor().eachAsync(async (v) => {
                                result.push({
                                    _id: v._id,
                                    id: v._id,
                                    filter: v.specification.specification,
                                    type: "Material",
                                    key: "material",
                                });
                            });

                        result = _.uniqBy(result, 'filter');
                    }

                    else if (keys[i] == "Type") {
                        await BusinessProduct.findOne({ subcategory: req.query.query, })
                            .cursor().eachAsync(async (v) => {
                                result.push({
                                    _id: v._id,
                                    id: v._id,
                                    filter: v.type,
                                    type: "Type",
                                    key: "type",
                                });
                            });

                        result = _.uniqBy(result, 'filter');
                    }

                    else if (keys[i] == "Variants") {
                        await BusinessProduct.findOne({ subcategory: req.query.query, })
                            .cursor().eachAsync(async (v) => {
                                if (v.specification.type) {
                                    var variant = v.specification.type;
                                    variant.forEach(function (k) {
                                        result.push({
                                            _id: v._id,
                                            id: v._id,
                                            filter: k,
                                            type: "Variants",
                                            key: "variants",
                                        });
                                    })
                                }
                            });

                        result = _.uniqBy(result, 'filter');
                    }

                    else if (keys[i] == "Model") {
                        await BusinessProduct.findOne({ subcategory: req.query.query })
                            .cursor().eachAsync(async (v) => {
                                if (v.models) {
                                    var models = v.models;
                                    models.forEach(function (m) {
                                        result.push({
                                            _id: v._id,
                                            id: v._id,
                                            filter: m,
                                            type: "Car",
                                            key: "car",
                                        });
                                    })
                                }
                            });

                        result = _.uniqBy(result, 'filter');
                    }
                }

                result = _(result).groupBy(x => x.type).map((filter, key) => ({ type: key, filters: filter })).value();

                client.setex('filter-' + productFilter.category, 3600, JSON.stringify(result))

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: result
                })
            }
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "No filters available",
            responseData: {}
        })
    }
});

router.get('/products/search/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var result = [];
    var query = req.query.query;

    await ProductKeyword.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
    )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .cursor().eachAsync(async (v) => {
            result.push({
                _id: v._id,
                id: v.id,
                keyword: v.suggestion,
                keyword_html: v.html_suggestion,
                type: "filter",
                property: v.property
            })
        });


    await BusinessProduct.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
    )
        .sort({ score: { $meta: 'textScore' } })
        .limit(5)
        .cursor().eachAsync(async (v) => {
            result.push({
                _id: v.product,
                id: v.product,
                keyword: v.title,
                keyword_html: v.title,
                type: "product",
            })
        });

    await BusinessProduct.find({ title: new RegExp(query, "i") })
        .limit(5)
        .cursor().eachAsync(async (v) => {
            result.push({
                _id: v.product,
                id: v.product,
                keyword_html: v.title,
                keyword: v.title,
                type: "product",
            });
        });


    result = _.uniqBy(result, 'keyword');

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result
    })
});

router.get('/products/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var product = [];
    var array = [];

    if (req.query.by == "category") {
        var query = {
            "$match": {
                category: mongoose.Types.ObjectId(req.query.query)
            }
        }
    }
    else if (req.query.by == "subcategory") {
        var query = { "$match": { subcategory: mongoose.Types.ObjectId(req.query.query) } }
    }
    else if (req.query.by == "brand") {
        var query = { "$match": { product_brand: mongoose.Types.ObjectId(req.query.query) } }
    }
    else if (req.query.by == "model") {
        var query = { "$match": { product_model: mongoose.Types.ObjectId(req.query.query) } }
    }
    else if (req.query.by == "id") {
        var query = { "$match": { product: mongoose.Types.ObjectId(req.query.query) } }
    }
    else if (req.query.by == "filter") {
        if (req.query.subcategory) {
            var specification = {};
            var subcategory = req.query.subcategory;
            specification["_subcategory"] = { $in: subcategory.split(',') }
            array.push(specification);
        }

        if (req.query.brand) {
            var specification = {};
            var brand = req.query.brand;
            specification['_product_brand'] = { $in: brand.split(',') }
            array.push(specification);
        }

        if (req.query.type) {
            var specification = {};
            var type = req.query.type;
            specification['type'] = { $in: type.split(',') }
            array.push(specification);
        }

        if (req.query.size) {
            var specification = {};
            var size = req.query.size;
            specification['specification.size'] = { $in: size.split(',') }
            array.push(specification);
        }

        if (req.query.material) {
            var specification = {};
            var material = req.query.material;
            specification['specification.specification'] = { $in: material.split(',') }
            array.push(specification);
        }

        if (req.query.variants) {
            var specification = {};
            var variants = req.query.variants;
            specification['specification.type'] = { $in: variants.split(',') }
            array.push(specification);
        }

        if (req.query.price) {
            var specification = {};
            var price = req.query.price;
            var min = price.split(',')[0];
            var max = price.split(',')[1];
            specification['price.sell_price'] = { $gte: parseInt(min), $lte: parseInt(max) }
            array.push(specification);
        }

        if (req.query.car) {
            var specification = {};/**/
            var models = req.query.car;
            specification['models'] = { $in: models.split(',') }
            array.push(specification);
        }

        var query = {
            "$match": {
                "$and": array
            }
        }
    }
    else {
        var query = {
            "$match": {
                "$or": [
                    { _subcategory: new RegExp(req.query.query, "i") },
                    { _category: new RegExp(req.query.query, "i") },
                    { type: new RegExp(req.query.query, "i") },
                    { _model: new RegExp(req.query.query, "i") },
                    { models: new RegExp(req.query.query, "i") },
                    { title: new RegExp(req.query.query, "i") },
                    { keywords: new RegExp(req.query.query, "i") },
                ]
            }
        }
    }

    await BusinessProduct.aggregate([
        query,
        { "$unwind": "$product_brand" },
        {
            "$lookup": {
                "from": "ProductBrand",
                "localField": "product_brand",
                "foreignField": "_id",
                "as": "product_brand"
            }
        },
        { "$unwind": "$category" },
        {
            "$lookup": {
                "from": "ProductCategory",
                "localField": "category",
                "foreignField": "_id",
                "as": "category"
            }
        },
        { "$unwind": "$subcategory" },
        {
            "$lookup": {
                "from": "ProductCategory",
                "localField": "subcategory",
                "foreignField": "_id",
                "as": "subcategory"
            }
        },
        { $sort: { "price.sell_price": -1 } },
        { $group: { _id: '$product', data: { $push: '$$ROOT' } } },
        { $skip: 20 * page },
        { $limit: 20 }
    ])
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (p) {
            var cart = await Cart.findOne({ product: p.data[0]._id, user: user }).exec();
            var title = p.data[0].title;
            if (_.includes(title, ',')) { title = title.replace(/,/g, ", ") }
            product.push({
                _id: p.data[0]._id,
                id: p.data[0]._id,
                product: p.data[0].product,
                title: title,
                price: p.data[0].price,
                thumbnail: 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/master/product/300/' + p.data[0].thumbnail,
                unit: p.data[0].unit,
                quantity: p.data[0].quantity,
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "query",
        responseData: {
            products: product,
            query: query
        }
    })
});

router.get('/product/detail/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    //paginate

    var product = {};

    await BusinessProduct.findOne({ product: req.query.id })
        .populate({ path: 'product_brand', select: 'value' })
        .populate({ path: 'product_model', select: 'value' })
        .populate({ path: 'category', select: "category" })
        .populate({ path: 'subcategory', select: "category" })
        .populate({ path: 'business', select: 'name username avatar avatar_address address' })
        .sort({ "price.sell_price": -1 })
        .cursor().eachAsync(async (p) => {

            var offers = []
            await ProductOffer.find({ $or: [{ source: null }, { source: p.category }] })
                .cursor().eachAsync(async (o) => {
                    var ofrs = o.offers;
                    ofrs.forEach(function (ofr) {
                        if (ofr.offer) {
                            offers.push({
                                offer: ofr.offer
                            })
                        }
                    })
                })


            var gallery = await Gallery.find({ source: p._id }).exec();
            var cart = await Cart.findOne({ product: p._id, user: user }).exec();
            var title = p.title;
            if (_.includes(title, ',')) { title = title.replace(/,/g, ", ") }

            product = {
                product: p.product,
                _id: p._id,
                id: p._id,
                product_brand: p.product_brand,
                product_model: p.product_model,
                category: p.category,
                subcategory: p.subcategory,
                business: p.business,
                title: title,
                price: p.price,
                stock: p.stock,
                tax: p.tax,
                specification: p.specification,
                product_id: p.product_id,
                short_description: p.short_description,
                long_description: p.long_description,
                thumbnail: p.preview,
                models: p.models,
                services: p.services,
                offers: offers,
                unit: p.unit,
                warranty: p.warranty,
                quantity: p.quantity,
                cart: cart,
            }
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            products: product
        }
    })
});

router.get('/product/gallery/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    var data = [];
    return client.get('gallery-' + req.query.product, async (err, result) => {
        if (result) {
            const resultJSON = JSON.parse(result);
            res.status(200).json({
                responseCode: 200,
                responseMessage: "[c]",
                responseData: resultJSON,
            });
        }
        else {
            var data = [];
            await ProductGallery.find({ product: req.query.product })
                .cursor().eachAsync(async (g) => {
                    if (g.type == "link") {
                        var url = g.file
                        var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                        var match = url.match(regExp);
                        if (match && match[2].length == 11) {
                            var file = "https://www.youtube.com/embed/" + match[2];
                        }
                        else {
                            var file = g.file
                        }
                    }
                    else {
                        var file = g.file_address;
                        file = file.replace(/\s/g, '');
                    }

                    data.push({
                        id: g._id,
                        type: g.type,
                        source: g.source,
                        file_address: file
                    })
                })

            client.setex('gallery-' + req.query.id, 3600, JSON.stringify(data))

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: data
            });
        }
    });
});

router.post('/cart/add', xAccessToken.token, async function (req, res, next) {
    // console.log("Cart Add", req.body)
    var rules = {
        product: 'required',
        business: 'required',
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

        var product = await BusinessProduct.findOne({ business: req.body.business, product: req.body.product }).exec()

        if (product) {
            var cart = await Cart.findOne({ product: product._id, user: user }).exec();
            if (cart) {
                var data = {
                    source: product.product,
                    product: product._id,
                    quantity: req.body.quantity,
                    services: req.body.services,
                    updated_at: new Date()
                };

                Cart.findOneAndUpdate({ _id: cart._id }, { $set: data }, { new: true }, async function (err, doc) {
                    var update = await Cart.findById(cart._id).exec()
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "success",
                        responseData: update
                    });
                })
            }
            else {
                var data = {
                    source: product.product,
                    product: product._id,
                    user: user,
                    business: req.body.business,
                    quantity: req.body.quantity,
                    services: req.body.services,
                    created_at: new Date(),
                    updated_at: new Date()
                };
                Cart.create(data).then(async function (cart) {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "success",
                        responseData: cart
                    });
                })
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Item not found",
                responseData: {}
            })
        }
    }
});

router.put('/cart/item/edit', xAccessToken.token, async function (req, res, next) {
    var rules = {
        item: 'required',
        quantity: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Item not found",
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

        var cart = await Cart.findById(req.body.item).exec()

        if (cart) {
            var data = {
                quantity: req.body.quantity,
                //services: req.body.services,
                updated_at: new Date()
            };

            Cart.findOneAndUpdate({ _id: cart._id }, { $set: data }, { new: true }, async function (err, doc) {
                var cart = await Cart.findById(req.body.item).exec()
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: cart
                });
            })
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Item not found",
                responseData: {}
            })
        }
    }
});

router.put('/cart/service/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        item: 'required',
        services: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Item not found",
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

        var cart = await Cart.findById(req.body.item).exec()

        if (cart) {
            var data = {
                services: req.body.services,
            };

            Cart.findOneAndUpdate({ _id: cart._id }, { $set: data }, { new: true }, async function (err, doc) {
                var cart = await Cart.findById(req.body.item).exec()
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: cart
                });
            })
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Item not found",
                responseData: {}
            })
        }
    }
});

router.delete('/cart/item/remove', xAccessToken.token, async function (req, res, next) {
    var rules = {
        item: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Item not found",
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

        var cart = await Cart.findById(req.body.item).exec()

        if (cart) {
            await Cart.findByIdAndRemove(cart._id).exec();
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Item Removed",
                responseData: {},
            })
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Item not found",
                responseData: {}
            })
        }
    }
});

router.get('/cart/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var total_items = 0;
    var product = [];
    await Cart.find({ user: user })
        .populate({ path: 'product' })
        .cursor().eachAsync(async (p) => {
            total_items = total_items + p.quantity;
            var cart = await Cart.findOne({ product: p.product._id, user: user }).exec();
            product.push({
                product: p.product.product,
                _id: p.product._id,
                id: p.product._id,
                title: p.product.title,
                price: p.product.price,
                stock: p.product.stock,
                tax: p.product.tax,
                specification: p.product.specification,
                product_id: p.product.product_id,
                short_description: p.product.short_description,
                long_description: p.product.long_description,
                thumbnail: p.product.preview,
                unit: p.product.unit,
                quantity: p.product.quantity,
                services: p.services,
                cart: cart
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: {
            total_items: total_items,
            items: product
        },
    });
});

router.post('/order/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var user = decoded.user;
    var data = [];
    var tax = [];

    var total = 0;
    var cart = await Cart.find({ user: user, wishlist: false }).exec();

    var checkOrder = await Order.findOne({ user: user, status: "Pending" }).exec();
    if (checkOrder) {
        await Order.remove({ _id: checkOrder._id, user: user }).exec();
        await OrderLine.remove({ user: user, order: checkOrder._id }).exec();
        await BusinessOrder.remove({ order: checkOrder._id }).exec();
    }

    var order = {
        car: null,
        user: user,
        order_no: Math.round(new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
        address: null,
        payment: {},
        delivery: null,
        due: {
            due: 0
        },
        status: "Pending",
        created_at: date,
        updated_at: date,
    };

    Order.create(order).then(async function (o) {
        User.findOneAndUpdate({ _id: user }, {
            $push: {
                "orders": o._id
            }
        }, { new: true }, async function (err, doc) {
            if (err) {
                // console.log(err)
            }
            else {
                // console.log(doc)
            }
        })

        var delivery = [];
        var charges = [];
        for (var i = 0; i < cart.length; i++) {
            var business = await User.findById(cart[i].business).exec();

            if (business) {
                var checkBusinessOrder = await BusinessOrder.find({ order: o._id, business: business._id }).count().exec();
                if (checkBusinessOrder == 0) {
                    BusinessOrder.create({
                        order: o._id,
                        user: user,
                        business: business._id,
                        delivery_date: new Date(),
                        time_slot: "",
                        charges: 0,
                        status: "Pending",
                        created_at: o.created_at,
                        updated_at: o.updated_at,
                    })
                }

                var items = cart[i].items;

                var product = await BusinessProduct.findOne({ business: cart[i].business, product: cart[i].source })
                    .populate({ 'path': 'category' })
                    .exec();
                if (product) {
                    var item_cost = product.price.sell_price * Math.ceil(cart[i].quantity);
                    total = total + item_cost;

                    var tax_info = product.tax_info;
                    var tax_details = tax_info.detail;

                    var x = (100 + tax_info.rate) / 100;
                    var tax_on_amount = item_cost / x;
                    if (tax_details.length > 0) {
                        for (var r = 0; r < tax_details.length; r++) {
                            if (tax_details[r].rate != tax_info.rate) {
                                var t = tax_on_amount * (tax_details[r].rate / 100);

                                tax.push({
                                    tax: tax_details[r].tax,
                                    rate: tax_details[r].rate,
                                    amount: parseFloat(t.toFixed(2))
                                });
                            }
                            else {
                                tax.push({
                                    tax: tax_info.tax,
                                    rate: tax_info.rate,
                                    amount: parseFloat(tax_on_amount.toFixed(2))
                                });
                            }
                        }
                    }

                    charges.push({
                        charges: product.convenience_charges,
                        business: product.business
                    });

                    delivery.push({
                        procurement: product.procurement_sla,
                        business: product.business
                    });

                    var order = {
                        order: o._id,
                        order_no: o.order_no,
                        source: product.product,
                        _category: product.category.category,
                        category: product.category._id,
                        subcategory: product.subcategory,
                        product_brand: product.product_brand,
                        product_model: product.product_model,
                        product: product._id,
                        cost: product.price.sell_price,
                        total: product.price.sell_price * cart[i].quantity,
                        title: product.title,
                        description: product.short_description,
                        quantity: cart[i].quantity,
                        thumbnail: product.preview,
                        tax_info: tax,
                        user: mongoose.Types.ObjectId(user.toString()),
                        business: mongoose.Types.ObjectId(business._id.toString()),
                        address: null,
                        date: date,
                        time_slot: "",
                        status: "Pending",
                        payment: {
                            paid_total: Math.ceil(item_cost),
                            total: Math.ceil(item_cost),
                        },
                        services: cart[i].services,
                        tracking_no: Math.round(new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                        created_at: date,
                        updated_at: date,
                    }

                    OrderLine.create(order)
                    tax = [];
                }
                else {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Product not found",
                        responseData: {}
                    })
                }
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Something went wrong!",
                    responseData: {}
                })
            }
        }

        var h = {};
        var charges = charges.reduce(function (r, d) {
            if (!h[d.business]) {
                r.push((h[d.business] = Object.assign(d)));
            } else {
                d.charges > h[d.business].charges && (h[d.business].charges = d.charges);
            }
            return r;
        }, []);


        var convenience_charges = _.sumBy(charges, x => x.charges);

        // console.log(charges)

        var payment = {
            payment_mode: "N/A",
            payment_status: "Pending",
            total: total,
            extra_charges_limit: 0,
            convenience_charges: convenience_charges,
            terms: "REFUND POLICY \n\nAll sales on the CarEager Platform are final with no refund or exchange permitted. However, if in a transaction, money is charged to your card or bank account but the order is not confirmed within 48 hours of the completion of the transaction, then you shall inform us by sending an e-mail to care@CarEager.com or by calling on our toll-free number. The following details needs to be provided – mobile number, transaction date, and order number. CarEager would investigate the incident and, if it is found that money was indeed charged without any valid order, then you will be refunded the money within 21 working days from the date of receipt of your e-mail. \n\n\n\nWARRANTY CLAIMS \n\nCarEager is not a warrantor of the products/services listed on CarEager platform which are offered by other manufacturers, Merchants, or vendors. You understand that any issue or dispute regarding the warranty, guarantee, quality, and service will be addressed as per the terms & conditions of the manufacturers, merchants, or suppliers, and you agree to handle such issues and disputes directly with the manufacturers, Merchants, or vendors. However, CarEager would assist you in getting the best after sale services.",
            discount_type: "",
            coupon_type: "",
            coupon: "",
            discount: 0,
            discount_total: 0,
            paid_total: 0,
            discount_applied: false,
            transaction_id: "",
            transaction_date: "",
            transaction_status: "",
            transaction_response: ""
        };

        var helper = {};
        var delivery = delivery.reduce(function (r, d) {
            if (!helper[d.business]) {
                r.push((helper[d.business] = Object.assign(d)));
            } else {
                d.procurement > helper[d.business].procurement && (helper[d.business].procurement = d.procurement);
            }
            return r;
        }, []);


        var update = {
            delivery: delivery,
            payment: payment,
            due: {
                due: 0
            }
        };

        Order.findOneAndUpdate({ _id: o._id }, { $set: update }, { new: false }, function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Error Occurred",
                    responseData: {}
                })
            }
            else {

                for (var c = 0; c < charges.length; c++) {
                    BusinessOrder.findOneAndUpdate({ order: o._id, business: charges[c].business }, { $set: { charges: charges[c].charges } }, { new: false }, function (err, doc) { })
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Order has been successfully placed",
                    responseData: {
                        order: o
                    }
                })
            }
        })
    });
});

router.get('/order/items/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var orders = [];

    await OrderLine.find({ order: req.query.order })
        .populate({ path: 'order' })
        .populate({ path: 'business', select: 'id name contact_no email' })
        .populate({ path: 'user', select: 'id name contact_no email' })
        .cursor()
        .eachAsync(async function (p) {
            var procurement = p.order.delivery;

            var delivery = _.filter(procurement, function (o) {
                return o.business == p.business._id.toString();
            });

            orders.push({
                _id: p._id,
                id: p.id,
                item: p.item,
                order: p.order,
                seller: p.business.name,
                business: p.business,
                address: p.address,
                order_no: p.order_no,
                tracking_no: p.tracking_no,
                status: p.status,
                payment: p.payment,
                log: p.log,
                date: p.date,
                time_slot: p.time_slot,
                services: p.services,
                procurement: delivery[0].procurement
            });
        });

    var orders = _(orders).groupBy(x => x.seller).map((value, key) => ({ seller: key, details: value })).value();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Items",
        responseData: orders
    });
});

router.post('/order/time-slot/', xAccessToken.token, async function (req, res, next) {
    var slots = [];
    var date = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
    var next = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
    next.setDate(date.getDate() + 1);

    var slot1 = await OrderLine.find({
        time_slot: "9:30 AM - 11:00 AM",
        business: req.body.business,
        date: { $gte: date, $lt: next },
        status: { $ne: "Inactive" },
        status: { $ne: "Pending" },
        $and: [{
            status: { $ne: "Delivered" }
        },
        {
            status: { $ne: "Cancelled" }
        }],
    }).count().exec();

    var slot2 = await OrderLine.find({
        time_slot: "11:00 AM - 1:00 PM",
        business: req.body.business,
        date: { $gte: date, $lt: next },
        status: { $ne: "Pending" },
        $and: [{
            status: { $ne: "Delivered" }
        },
        {
            status: { $ne: "Cancelled" }
        }],
    }).count().exec();

    var slot3 = await OrderLine.find({
        time_slot: "1:30 PM - 3:00 PM",
        business: req.body.business,
        date: { $gte: date, $lt: next },
        status: { $ne: "Pending" },
        $and: [{
            status: { $ne: "Delivered" }
        },
        {
            status: { $ne: "Cancelled" }
        }],
    }).count().exec();

    var slot4 = await OrderLine.find({
        time_slot: "3:00 PM - 5:30 PM",
        business: req.body.business,
        date: { $gte: date, $lt: next },
        status: { $ne: "Pending" },
        $and: [{
            status: { $ne: "Delivered" }
        },
        {
            status: { $ne: "Cancelled" }
        }],
    }).count().exec();



    if (slot1 > 3) {
        slots.push({
            slot: "9:30 AM - 11:00 AM",
            count: slot1,
            status: false
        });
    }
    else {
        slots.push({
            slot: "9:30 AM - 11:00 AM",
            count: slot1,
            status: true
        });
    }

    if (slot2 > 3) {
        slots.push({
            slot: "11:00 AM - 1:00 PM",
            count: slot2,
            status: false
        });
    }
    else {
        slots.push({
            slot: "11:00 AM - 1:00 PM",
            count: slot2,
            status: true
        });
    }

    if (slot3 > 3) {
        slots.push({
            slot: "1:30 PM - 3:00 PM",
            count: slot3,
            status: false
        });
    }
    else {
        slots.push({
            slot: "1:30 PM - 3:00 PM",
            count: slot3,
            status: true
        });
    }

    if (slot4 > 3) {
        slots.push({
            slot: "3:00 PM - 5:30 PM",
            count: slot4,
            status: false
        });
    }
    else {
        slots.push({
            slot: "3:00 PM - 5:30 PM",
            count: slot4,
            status: true
        });
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: date + " " + next,
        responseData: slots
    })
});

router.get('/order/convenience', xAccessToken.token, async function (req, res, next) {
    var business = [];
    var conveniences = [];


    await OrderConvenience.find({})
        .cursor()
        .eachAsync(async function (p) {
            if (p.convenience != "Delivery") {
                conveniences.push({
                    _id: p._id,
                    _id: p._id,
                    convenience: p.convenience,
                    chargeable: p.chargeable,
                });
            }
        });

    await BusinessOrder.find({ order: req.query.order })
        .cursor()
        .eachAsync(async function (p) {
            business.push({
                business: p.business,
                conveniences: conveniences,
                charges: p.charges,
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: business
    })
});

router.get('/order/conveniences/get', xAccessToken.token, async function (req, res, next) {
    var business = [];

    await BusinessOrder.find({ order: req.query.order })
        .cursor()
        .eachAsync(async function (p) {
            var conveniences = [];
            await OrderConvenience.find({ business: p.business })
                .cursor()
                .eachAsync(async function (oc) {
                    conveniences.push({
                        _id: oc._id,
                        _id: oc._id,
                        convenience: oc.convenience,
                        chargeable: oc.chargeable,
                        charges: oc.charges,
                    });
                });
            business.push({
                business: p.business,
                conveniences: conveniences,
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: business
    })
});

router.put('/order/details/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var orders = [];
    var address = null

    // console.log(req.body)

    var order = await Order.findOne({ _id: req.body.order }).exec();
    if (order) {
        if (req.body.address) {
            var checkAddress = await Address.findOne({ _id: req.body.address }).exec();
            if (checkAddress) {
                address = checkAddress._id;
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Address not found",
                    responseData: {}
                })
            }
        }


        var sellers = req.body.timings;
        var update = new Object();
        var due = order.payment.total - order.payment.discount_total;
        for (var s = 0; s < sellers.length; s++) {
            var seller = await BusinessOrder.findOne({ business: sellers[s].business, order: order._id }).exec();
            if (seller) {
                var convenience = await OrderConvenience.findOne({ convenience: sellers[s].convenience, business: sellers[s].business }).exec();
                if (convenience.chargeable == false) {
                    var charges = 0;
                }
                else {
                    if (order.payment.total >= 1500 && sellers[s].convenience == "Delivery") {
                        var charges = 0;
                        due = due + charges
                    }
                    else {
                        var charges = convenience.charges;
                    }
                }

                var due = {
                    due: due + charges,
                    pay: 0
                }

                var payment = {
                    payment_mode: "N/A",
                    payment_status: "Pending",
                    total: order.payment.total,
                    extra_charges_limit: order.payment.extra_charges_limit,
                    convenience_charges: charges,
                    terms: order.payment.terms,
                    coupon_type: order.payment.coupon_type,
                    coupon: order.payment.coupon,
                    discount: order.payment.discount,
                    discount_total: order.payment.discount_total,
                    paid_total: order.payment.paid_total,
                    discount_applied: order.payment.discount_applied,
                    transaction_id: order.payment.transaction_id,
                    transaction_date: order.payment.transaction_date,
                    transaction_status: order.payment.transaction_status,
                    transaction_response: order.payment.transaction_response
                };

                Order.findOneAndUpdate({ _id: order._id }, { $set: { convenience: sellers[s].convenience, address: address, payment: payment, due: due } }, { new: true }, function (err, doc) { });

                var businessData = {
                    delivery_date: new Date(sellers[s].date).toISOString(),
                    time_slot: sellers[s].time_slot,
                    convenience: sellers[s].convenience,
                    charges: convenience.charges
                };

                BusinessOrder.update({ order: order._id, business: seller.business }, { "$set": businessData }, function (err, numAffected) { });

                OrderLine.update(
                    { order: order._id, business: seller.business },
                    { "$set": { date: new Date(sellers[s].date).toISOString(), time_slot: sellers[s].time_slot, } },
                    function (err, numAffected) {
                        if (err) {
                        }
                    }
                );
            }

        }

        update = await Order.findById(req.body.order).exec();

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: update
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        })
    }
});

router.put('/order/status/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var orders = [];
    var address = null

    var order = await Order.findOne({ _id: req.body.id, user: user }).exec();
    if (order) {
        var status = req.body.status;
        await OrderLine.find({ order: order._id })
            .cursor()
            .eachAsync(async function (p) {
                OrderLine.findOneAndUpdate({ _id: p._id }, { $set: { status: status } }, { new: false }, async function (err, doc) {
                    OrderLine.findOneAndUpdate({ _id: p._id }, { $push: { log: { status: status, created_at: order.updated_at, updated_at: order.updated_at } } }, { new: false }, async function (err, doc) {
                        // console.log("push")
                    })
                })
            })

        await BusinessOrder.find({ order: order._id })
            .cursor()
            .eachAsync(async function (p) {
                BusinessOrder.findOneAndUpdate({ _id: p._id }, { $set: { status: status } }, { new: false }, async function (err, doc) {
                    BusinessOrder.findOneAndUpdate({ _id: p._id }, { $push: { log: { status: status, created_at: order.updated_at, updated_at: order.updated_at } } }, { new: false }, async function (err, doc) {
                    })
                })
            })

        if (req.body.status == "Cancelled") {

            if (order.payment.discount_type == "coupon") {
                var checkCouponUsed = await CouponUsed.find({ user: user, order: order._id }).count().exec();
                if (checkCouponUsed > 0) {
                    await CouponUsed.remove({ user: user, order: order._id }).exec();
                }
            }

            else if (order.payment.discount_type == "coins") {
                if (order.payment.discount > 0) {
                    var point = {
                        status: true,
                        user: user,
                        activity: "coin",
                        tag: "OrderCancelled",
                        points: order.payment.discount,
                        title: "",
                        body: "",
                        source: order._id,
                        sender: null
                    };

                    fun.addPoints(point)
                }
            }
        }

        event.orderStatusMail(order._id, req.headers['tz'])

        if (order.due) {
            Order.findOneAndUpdate({ _id: order._id }, { $set: { due: null } }, { new: false }, async function (err, doc) { })
        }

        var update = await Order.findOne({ _id: order._id }).exec();
        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: update
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        })
    }
});

router.post('/order/coupon/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var data = {};

    var order = await Order.findOne({ _id: req.body.order, user: user }).exec();
    var coupon = await Coupon.findOne({ code: req.body.coupon.toUpperCase(), is_product: true }).exec();
    var used = await CouponUsed.findOne({ code: req.body.coupon.toUpperCase(), user: user }).count().exec();

    if (order) {
        var order_total = order.payment.total;

        if (req.body.type == "coupon") {
            if (coupon) {
                if (used == 0) {
                    var serverTime = moment.tz(new Date(), req.headers['tz']);
                    var bar = moment.tz(coupon.expired_at, req.headers['tz']);
                    var baz = bar.diff(serverTime);
                    if (baz > 0) {
                        var limit = await CouponUsed.findOne({ code: req.body.coupon.toUpperCase() }).count().exec();
                        if (limit != coupon.limit) {
                            var items = await OrderLine.find({ order: order._id }).select('cost total title description quantity thumbnail _category').exec();
                            if (coupon.price_limit) {
                                if (coupon.price_limit <= order_total) {
                                    if (coupon.for == "category") {
                                        var coupon_for = _.filter(items, _category => _category._category == coupon.label);
                                        var coupon_cost = _.sumBy(coupon_for, x => x.total);
                                        var total = order_total - coupon_cost;

                                        if (coupon.type == "percent") {
                                            var discount = coupon_cost * (coupon.discount / 100);
                                            var paid_total = total + (coupon_cost - discount) + order.payment.convenience_charges;
                                        }
                                        else if (coupon.type == "price") {
                                            var discount = coupon.discount
                                            var paid_total = total + (coupon_cost - discount) + order.payment.convenience_charges;
                                        }
                                    }
                                    else if (coupon.for == "specific") {
                                        var coupon_for = _.filter(items, title => title.title == coupon.label);
                                        var coupon_cost = _.sumBy(coupon_for, x => x.total);
                                        var total = order_total - coupon_cost;


                                        if (coupon.type == "percent") {
                                            var discount = coupon_cost * (coupon.discount / 100);
                                            var paid_total = total + (coupon_cost - discount) + order.payment.convenience_charges;
                                        }

                                        else if (coupon.type == "price") {
                                            var discount = coupon.discount;
                                            var paid_total = total + (coupon_cost - discount) + order.payment.convenience_charges;
                                        }

                                        else if (coupon.type == "fixed") {
                                            var discount = coupon_cost - coupon.discount;
                                            var paid_total = total + coupon.discount + order.payment.convenience_charges;
                                        }
                                    }
                                    else if (coupon.for == "order") {
                                        if (coupon.type == "percent") {
                                            var discount = order_total * (coupon.discount / 100);
                                            var paid_total = order_total - discount + order.payment.convenience_charges;
                                        }
                                        else if (coupon.type == "price") {
                                            var discount = coupon.discount;
                                            var paid_total = order_total - discount + order.payment.convenience_charges;
                                        }
                                    }


                                    var data = {
                                        payment: {
                                            payment_mode: "N/A",
                                            payment_status: "Pending",
                                            total: order.payment.total,
                                            extra_charges_limit: order.payment.extra_charges_limit,
                                            convenience_charges: order.payment.convenience_charges,
                                            terms: order.payment.terms,
                                            discount_type: "coupon",
                                            coupon_type: coupon.discount,
                                            coupon: coupon.code,
                                            discount: coupon.discount,
                                            discount_total: discount,
                                            paid_total: 0,
                                            discount_applied: false,
                                            transaction_id: "",
                                            transaction_date: "",
                                            transaction_status: "",
                                            transaction_response: ""
                                        },
                                        due: {
                                            due: paid_total
                                        },
                                        update: new Date()
                                    }

                                    if (data.payment.paid_total >= 0) {
                                        Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
                                            if (err) {
                                                res.status(422).json({
                                                    responseCode: 422,
                                                    responseMessage: paid_total,
                                                    responseData: {
                                                        err: err,
                                                        items: items
                                                    }
                                                })
                                            }
                                            else {
                                                res.status(200).json({
                                                    responseCode: 200,
                                                    responseMessage: "Coupon Applied",
                                                    responseData: data
                                                })
                                            }
                                        });
                                    }
                                    else {
                                        res.status(422).json({
                                            responseCode: 422,
                                            responseMessage: "Coupon cannot be applied on this order",
                                            responseData: {}
                                        });
                                    }
                                }
                                else {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Not valid for this order",
                                        responseData: {}
                                    })
                                }
                            }
                            else {
                                if (coupon.for == "category") {
                                    var coupon_for = _.filter(items, _category => _category._category == coupon.label);
                                    var coupon_cost = _.sumBy(coupon_for, x => x.total);
                                    var total = order_total - coupon_cost;

                                    if (coupon.type == "percent") {
                                        var discount = coupon_cost * (coupon.discount / 100);
                                        var paid_total = total + (coupon_cost - discount) + order.payment.convenience_charges;
                                    }
                                    else if (coupon.type == "price") {
                                        var discount = coupon.discount
                                        var paid_total = total + (coupon_cost - discount) + order.payment.convenience_charges;
                                    }
                                }
                                else if (coupon.for == "specific") {
                                    var coupon_for = _.filter(items, title => title.title == coupon.label);
                                    var coupon_cost = _.sumBy(coupon_for, x => x.total);
                                    var total = order_total - coupon_cost;


                                    if (coupon.type == "percent") {
                                        var discount = coupon_cost * (coupon.discount / 100);
                                        var paid_total = total + (coupon_cost - discount) + order.payment.convenience_charges;
                                    }

                                    else if (coupon.type == "price") {
                                        var discount = coupon.discount;
                                        var paid_total = total + (coupon_cost - discount) + order.payment.convenience_charges;
                                    }

                                    else if (coupon.type == "fixed") {
                                        var discount = coupon_cost - coupon.discount;
                                        var paid_total = total + coupon.discount + order.payment.convenience_charges;
                                    }
                                }
                                else if (coupon.for == "order") {
                                    if (coupon.type == "percent") {
                                        var discount = order_total * (coupon.discount / 100);
                                        var paid_total = order_total - discount + order.payment.convenience_charges;
                                    }
                                    else if (coupon.type == "price") {
                                        var discount = coupon.discount;
                                        var paid_total = order_total - discount + order.payment.convenience_charges;
                                    }
                                }



                                var data = {
                                    payment: {
                                        payment_mode: "N/A",
                                        payment_status: "Pending",
                                        total: order.payment.total,
                                        extra_charges_limit: order.payment.extra_charges_limit,
                                        convenience_charges: order.payment.convenience_charges,
                                        terms: order.payment.terms,
                                        discount_type: "coupon",
                                        coupon_type: coupon.discount,
                                        coupon: coupon.code,
                                        discount: coupon.discount,
                                        discount_total: discount,
                                        paid_total: 0,
                                        discount_applied: false,
                                        transaction_id: "",
                                        transaction_date: "",
                                        transaction_status: "",
                                        transaction_response: ""
                                    },
                                    due: {
                                        due: paid_total
                                    },
                                    update: new Date()
                                }

                                if (data.payment.paid_total >= 0) {
                                    Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
                                        if (err) {
                                            res.status(422).json({
                                                responseCode: 422,
                                                responseMessage: paid_total,
                                                responseData: {
                                                    err: err,
                                                    items: items
                                                }
                                            })
                                        }
                                        else {
                                            res.status(200).json({
                                                responseCode: 200,
                                                responseMessage: "Coupon Applied",
                                                responseData: data
                                            })
                                        }
                                    });
                                }
                                else {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Coupon cannot be applied on this order",
                                        responseData: {}
                                    });
                                }
                            }
                        }
                    }
                    else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Not valid for this order",
                            responseData: {}
                        })
                    }
                }
                else {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Coupon has been Expired",
                        responseData: {}
                    })
                }
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Invalid Coupon",
                    responseData: {}
                })
            }
        }
        else if (req.body.type == "coins") {

            var data = {
                payment: {
                    payment_mode: "N/A",
                    payment_status: "Pending",
                    total: order_total,
                    extra_charges_limit: order.payment.extra_charges_limit,
                    convenience_charges: order.payment.convenience_charges,
                    terms: order.payment.terms,
                    discount_type: "coins",
                    coupon_type: "",
                    coupon: "",
                    discount: 0,
                    discount_total: 0,
                    paid_total: 0,
                    discount_applied: false,
                    transaction_id: "",
                    transaction_date: "",
                    transaction_status: "",
                    transaction_response: ""
                },
                due: {
                    due: order_total + order.payment.convenience_charges
                },
                update: new Date()
            }

            if (data.payment.paid_total >= 0) {
                Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
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
                            responseData: data
                        })
                    }
                });
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Coupon cannot be applied on this booking" + data.payment.paid_total,
                    responseData: {}
                });
            }
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        })
    }
});

router.delete('/order/coupon/remove', xAccessToken.token, async function (req, res, next) {
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
        var order = await Order.findById(req.body.id).exec();
        var coupon = await Coupon.findOne({ code: req.body.coupon }).exec();

        if (order) {
            if (order.status == "Pending") {
                data = {
                    payment: {
                        payment_mode: "N/A",
                        discount_type: "",
                        coupon: '',
                        coupon_type: '',
                        discount: 0,
                        discount_total: 0,
                        terms: order.payment.terms,
                        convenience_charges: Math.ceil(order.payment.convenience_charges),
                        pick_up_limit: Math.ceil(order.payment.pick_up_limit),
                        pick_up_charges: Math.ceil(order.payment.pick_up_charges),
                        paid_total: Math.ceil(order.payment.total),
                        total: Math.ceil(order.payment.total),
                        discount_applied: false,
                        transaction_id: "",
                        transaction_date: "",
                        transaction_status: "",
                        transaction_response: ""
                    },
                    due: {
                        due: order.payment.total + order.payment.convenience_charges
                    }
                };


                Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Something went wrong",
                            responseData: err
                        })
                    }
                    else {
                        if (req.body.type == "coupon") {
                            await CouponUsed.remove({ user: user, order: order._id }).exec();
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
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});

router.get('/order/checksum/generate', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var paramarray = new Object();
    var discount = 0;


    var check = await Order.findById(req.query.id).exec();
    var getUser = await User.findById(user).exec();
    if (check) {
        if (getUser.email) {
            if (req.query.pay) {
                if (check.due) {
                    var data = {
                        due: {
                            due: check.due.due,
                            pay: parseFloat(req.query.pay)
                        },
                        transaction_id: Math.round(+new Date() / 1000),
                        updated_at: new Date()
                    };
                }
                else {
                    var data = {
                        due: {
                            due: check.payment.paid_total,
                            pay: parseFloat(req.query.pay)
                        },
                        transaction_id: Math.round(+new Date() / 1000),
                        updated_at: new Date()
                    };
                }
            }
            else {
                var data = {
                    transaction_id: Math.round(+new Date() / 1000),
                    updated_at: new Date()
                }
            }

            Order.findOneAndUpdate({ _id: req.query.id }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Error Occurred",
                        responseData: {}
                    })
                }
                else {
                    var order = await Order.findById(req.query.id).exec();
                    if (order.user == user) {
                        if (order.due) {
                            if (req.query.pay) {
                                var total = order.due.pay;
                                total = Math.ceil(total)
                            }
                            else {
                                var total = order.due.due;
                                total = Math.ceil(total)
                            }
                        }
                        else {
                            var total = order.payment.paid_total;
                            total = Math.ceil(total)
                        }

                        var paramarray = {
                            MID: paytm_config.MID,
                            ORDER_ID: order.transaction_id.toString(),
                            CUST_ID: user.toString(),
                            INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
                            CHANNEL_ID: "WAP",
                            TXN_AMOUNT: total.toString(),
                            WEBSITE: paytm_config.WEBSITE,
                            CALLBACK_URL: paytm_config.CALLBACK + 'theia/paytmCallback?ORDER_ID=' + order.transaction_id.toString(),
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
                                    responseMessage: "Checksum generated",
                                    responseData: data
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
        }
        else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Please add your email address",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order Not Found",
            responseData: {}
        });
    }
});

router.get('/order/transaction/complete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var paramarray = new Object();
    var discount = 0;
    var order = await Order.findOne({ transaction_id: req.query.id }).exec();
    var getUser = await User.findById(user).exec();
    if (order) {
        if (order.user == user) {
            if (order.due != null) {
                if (order.due.pay) {
                    var paid_total = Math.ceil(order.payment.paid_total) + Math.ceil(order.due.pay)
                }
                else {
                    var paid_total = Math.ceil(order.payment.paid_total) + Math.ceil(order.due.due)
                }
            }

            var paramarray = {
                MID: paytm_config.MID,
                ORDER_ID: order.transaction_id.toString(),
                CUST_ID: user.toString(),
                INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
                CHANNEL_ID: "WAP",
                TXN_AMOUNT: paid_total.toString(),
                WEBSITE: paytm_config.WEBSITE,
                CALLBACK_URL: paytm_config.CALLBACK + 'theia/paytmCallback?ORDER_ID=' + req.query.id,
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
                            if (order.due) {
                                if (order.due.pay) {
                                    var due = order.due.due - parseFloat(paytmRes.TXNAMOUNT);
                                    if (Math.ceil(due)) {
                                        var due_info = {
                                            due: Math.ceil(due),
                                            pay: 0
                                        }
                                    }
                                    else {
                                        var due_info = null
                                    }
                                }
                            } else {
                                var due_info = null
                            }

                            var data = {
                                status: "Ordered",
                                payment: {
                                    convenience_charges: Math.ceil(order.payment.convenience_charges),
                                    payment_mode: order.payment.payment_mode,
                                    payment_status: "Success",
                                    discount_type: order.payment.discount_type,
                                    coupon: order.payment.coupon,
                                    coupon_type: order.payment.coupon_type,
                                    discount: order.payment.discount,
                                    discount_total: order.payment.discount_total,
                                    discount_applied: order.payment.discount_applied,
                                    terms: order.payment.terms,
                                    pick_up_limit: order.payment.pick_up_limit,
                                    pick_up_charges: order.payment.pick_up_charges,
                                    paid_total: Math.ceil(paid_total),
                                    total: Math.ceil(order.payment.total),
                                    transaction_id: paytmRes.TXNID,
                                    transaction_date: paytmRes.TXNDATE,
                                    transaction_status: paytmRes.STATUS,
                                    transaction_response: paytmRes.RESPMSG
                                },
                                due: due_info,
                                updated_at: new Date()
                            };

                            Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Error Occurred",
                                        responseData: {}
                                    })
                                }
                                else {
                                    var updated = await Order.findById(order._id).exec();
                                    var activity = {
                                        user: updated.user,
                                        model: "Order",
                                        activity: "paymentSuccess",
                                        source: updated._id,
                                        modified: "",
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                    fun.activityLog(activity);

                                    fun.orderTransactionLog(updated._id, parseFloat(paytmRes.TXNAMOUNT));

                                    fun.orderLog(updated._id, updated.status);

                                    if (updated.payment.discount_applied == false) {
                                        if (updated.payment.discount_type == "coins") {
                                            var getCoins = await User.findById(updated.user).select('careager_cash').exec();
                                            var remain = getCoins.careager_cash - updated.payment.discount;

                                            if (updated.payment.discount > 0) {
                                                var point = {
                                                    status: true,
                                                    user: updated.user,
                                                    activity: "order",
                                                    tag: "usedInOrder",
                                                    points: updated.payment.discount,
                                                    source: updated._id,
                                                    created_at: new Date(),
                                                    updated_at: new Date(),
                                                    type: "debit",
                                                };

                                                Point.create(point).then(async function (point) {
                                                    User.findOneAndUpdate({ _id: updated.user }, { $set: { careager_cash: remain } }, { new: false }, async function (err, doc) { });

                                                    Order.findOneAndUpdate({ _id: updated._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                                                })
                                            }
                                        }

                                        else if (updated.payment.discount_type == "coupon" && updated.payment.discount_total > 0) {
                                            var coupon = await Coupon.findOne({ code: updated.payment.coupon }).exec();
                                            var used = await CouponUsed.findOne({ code: updated.code, user: updated.user }).count().exec();
                                            if (used == 0) {
                                                CouponUsed.create({
                                                    coupon: coupon._id,
                                                    code: coupon.code,
                                                    order: updated._id,
                                                    user: updated.user,
                                                    created_at: new Date(),
                                                    updated_at: new Date()
                                                });

                                                Order.findOneAndUpdate({ _id: updated._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                                            }
                                        }
                                    }


                                    var businesses = _.map(updated.delivery, 'business');

                                    var notify = {
                                        receiver: businesses,
                                        activity: "order",
                                        tag: "newOrder",
                                        source: updated._id,
                                        sender: updated.user,
                                        points: 0
                                    }

                                    fun.newNotification(notify);

                                    event.orderMail(updated._id, req.headers['tz']);

                                    Cart.remove({ user: user, wishlist: false }).exec();

                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Order has been successfully placed.",
                                        responseData: paytmRes
                                    });
                                }

                            });
                        }
                        else {
                            if (order.due) {
                                var data = {
                                    status: "PaymentFailed",
                                    payment: {
                                        convenience_charges: Math.ceil(order.payment.convenience_charges),
                                        payment_mode: order.payment.payment_mode,
                                        payment_status: "Failure",
                                        discount_type: order.payment.discount_type,
                                        coupon: order.payment.coupon,
                                        coupon_type: order.payment.coupon_type,
                                        discount: order.payment.discount,
                                        terms: order.payment.terms,
                                        pick_up_limit: order.payment.pick_up_limit,
                                        pick_up_charges: order.payment.pick_up_charges,
                                        discount_total: order.payment.discount_total,
                                        paid_total: Math.ceil(order.payment.paid_total),
                                        total: Math.ceil(order.payment.total),
                                        discount_applied: order.payment.discount_applied,
                                        transaction_id: paytmRes.TXNID,
                                        transaction_date: paytmRes.TXNDATE,
                                        transaction_status: paytmRes.STATUS,
                                        transaction_response: paytmRes.RESPMSG,
                                        transaction_response: paytmRes.TXNAMOUNT
                                    },
                                    due: order.due
                                }
                            }
                            else {
                                var data = {
                                    status: "PaymentFailed",
                                    payment: {
                                        convenience_charges: Math.ceil(order.payment.convenience_charges),
                                        payment_mode: order.payment.payment_mode,
                                        payment_status: "Failure",
                                        discount_type: order.payment.discount_type,
                                        coupon: order.payment.coupon,
                                        coupon_type: order.payment.coupon_type,
                                        discount: order.payment.discount,
                                        terms: order.payment.terms,
                                        discount_total: order.payment.discount_total,
                                        pick_up_limit: order.payment.pick_up_limit,
                                        pick_up_charges: order.payment.pick_up_charges,
                                        paid_total: Math.ceil(order.payment.paid_total),
                                        total: Math.ceil(order.payment.total),
                                        discount_applied: order.payment.discount_applied,
                                        transaction_id: paytmRes.TXNID,
                                        transaction_date: paytmRes.TXNDATE,
                                        transaction_status: paytmRes.STATUS,
                                        transaction_response: paytmRes.RESPMSG,
                                        transaction_response: paytmRes.TXNAMOUNT
                                    },
                                    due: {
                                        due: order.payment.paid_total
                                    }
                                }
                            }

                            Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Error Occurred",
                                        responseData: {}
                                    })
                                }
                                else {
                                    var updated = await Order.findById(order._id).exec();
                                    fun.transactionLog(updated._id, parseFloat(paytmRes.TXNAMOUNT));
                                    fun.orderLog(updated._id, updated.status);
                                    if (updated.payment.discount_applied == false) {
                                        if (updated.payment.discount_type == "coins") {
                                            var getCoins = await User.findById(updated.user).select('careager_cash').exec();
                                            var remain = getCoins.careager_cash - updated.payment.discount;

                                            if (order.payment.discount > 0) {
                                                var point = {
                                                    status: true,
                                                    user: updated.user,
                                                    activity: "order",
                                                    tag: "usedInorder",
                                                    points: updated.payment.discount,
                                                    source: updated._id,
                                                    created_at: new Date(),
                                                    updated_at: new Date(),
                                                    type: "debit",
                                                };

                                                Point.create(point).then(async function (point) {
                                                    User.findOneAndUpdate({ _id: updated.user }, { $set: { careager_cash: remain } }, { new: false }, async function (err, doc) { });

                                                    Order.findOneAndUpdate({ _id: updated._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                                                })
                                            }
                                        }

                                        else if (updated.payment.discount_type == "coupon" && updated.payment.discount_total != 0 && updated.payment.discount_total) {
                                            var coupon = await Coupon.findOne({ code: updated.payment.coupon }).exec();
                                            var used = await CouponUsed.findOne({ code: updated.payment.coupon, user: updated.user }).count().exec();
                                            if (used == 0) {
                                                CouponUsed.create({
                                                    coupon: coupon._id,
                                                    code: coupon.code,
                                                    order: updated._id,
                                                    user: updated.user,
                                                    created_at: new Date(),
                                                    updated_at: new Date()
                                                });

                                                Order.findOneAndUpdate({ _id: updated._id }, { $set: { "payment.discount_applied": true } }, { new: false }, async function (err, doc) { })
                                            }
                                        }
                                    }
                                }
                            });

                            Cart.remove({ user: user, wishlist: false }).exec();

                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Your transaction has been declined",
                                responseData: paytmRes
                            })
                        }

                    }
                });
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
            responseMessage: "Order Not Found",
            responseData: {}
        });
    }
});

router.get('/orders/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;
    var orders = [];

    var country = await Country.findOne({ timezone: { $in: req.headers['tz'] } }).exec();

    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    await Order.find({ user: user, status: { $ne: "Pending" } })
        .populate({ path: 'user', select: 'id name contact_no email' })
        .populate({ path: 'address' })
        .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
        .cursor()
        .eachAsync(async function (o) {
            await BusinessOrder.find({ order: o._id })
                .populate({ path: 'business', select: 'id name contact_no email' })
                .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
                .cursor()
                .eachAsync(async function (p) {
                    var items = await OrderLine.find({ order: o._id, business: p.business }).select('cost total title description quantity thumbnail').exec();
                    orders.push({
                        _id: o.order,
                        id: p.order,
                        business: p.business,
                        items: items,
                        date: moment(p.delivery_date).tz(req.headers['tz']).format('ll'),
                        time_slot: p.time_slot,
                        convenience: p.convenience,
                        order_no: o.order_no,
                        address: o.address,
                        payment: o.payment,
                        due: o.due,
                        log: p.log,
                        status: _.startCase(p.status),
                        created_at: o.created_at,
                        updated_at: o.updated_at,
                        listing: "order",
                    });
                });
        });

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

    await Booking.find({ 'user': user, status: { $in: ["Cancelled", "Confirmed", "Pending", "Rejected", "Closed", "Completed", "Failure", "In-Process", "Dissatisfied", "Approval", "Approved", "Failed", "JobInitiated", "JobOpen", "EstimateRequested", "ApprovalAwaited", "StartWork", "CloseWork", "CompleteWork", "StoreApproval", "GMApproval", "Rework", "Ready"] }, is_services: true })
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

    orders = _.orderBy(orders, ['created_at'], ['desc']);

    res.status(200).json({
        responseCode: 200,
        responseMessage: country.countryName,
        responseData: orders
    });
});

router.get('/order/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    var order = []
    var items = [];

    var o = await Order.findOne({ _id: req.query.id })
        .populate({ path: 'user', select: 'id name contact_no email' })
        .populate({ path: 'address' })
        .exec();

    if (o) {
        event.orderStatusMail(o._id, req.headers['tz'])

        await BusinessOrder.find({ order: o._id })
            .populate({ path: 'business', select: 'id name contact_no email' })
            .cursor()
            .eachAsync(async function (p) {
                var orderLine = await OrderLine.find({ order: o._id, business: p.business }).select('cost total title description quantity services thumbnail').exec();

                items.push({
                    business: p.business,
                    date: moment(p.date).tz(req.headers['tz']).format('ll'),
                    time_slot: p.time_slot,
                    items: orderLine
                })
            });

        order.push({
            _id: o._id,
            items: items,
            order_no: o.order_no,
            address: o.address,
            payment: o.payment,
            due: o.due,
            created_at: o.created_at,
            updated_at: o.updated_at,
        });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: order
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {}
        });
    }
});

router.get('/products/offers/get', async function (req, res, next) {
    var items = [];
    await ProductOffer.find({})
        .sort({ created_at: -1 })
        .cursor()
        .eachAsync(async function (p) {
            items.push({
                business: p.business,
                valid_till: moment(p.valid_till).tz(req.headers['tz']).format('ll'),
                offer: p.offer,
                description: p.description,
                file_address: p.file_address,
                source: p.source,
                type: p.type
            })
        });


    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: items
    });
});

router.post('/car/sell/verification', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var loggedInDetails = await User.findById(decoded.user).exec();
    var sell = await CarSell.findOne({ _id: req.body.sell, otp: req.body.otp, buyer: null, sold: false }).exec();

    var validation = false;
    if (sell) {
        var car = await Car.findById(sell.car).exec();
        if (car) {
            var data = {
                user_verified: true,
                admin_verified: false,
                updated_at: new Date()
            }

            CarSell.findOneAndUpdate({ _id: req.body.sell }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Server Error",
                        responseData: err
                    })
                }
                else {
                    CarSell.findOneAndUpdate({ _id: req.body.sell }, {
                        $push: {
                            user: loggedInDetails._id,
                            name: loggedInDetails.name,
                            status: "SellerVerfied",
                            remark: "",
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    }, { new: false }, async function (err, doc) {
                        if (err) {
                            res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Error Occured",
                                responseData: err
                            });
                        }
                        else {
                            Car.findOneAndUpdate({ _id: car._id }, {
                                $set: {
                                    publish: true,
                                    updated_at: new Date()
                                }
                            }, { new: false }, function (err, doc) {
                                if (err) {
                                    res.status(400).json({
                                        responseCode: 400,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    })
                                }
                                else {
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Admin approval pending",
                                        responseData: {}
                                    })
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            return res.status(400).json({
                responseCode: 400,
                responseMessage: "Car not found",
                responseData: {}
            })
        }
    }
    else {
        return res.status(400).json({
            responseCode: 400,
            responseMessage: "Listing not found",
            responseData: {}
        })
    }
});

router.get('/sold/cars/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = decoded.user;
    var result = [];
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    await CarSell.find({ seller: business })
        .populate({ path: 'car' })
        .populate({ path: 'seller', select: 'name username avatar avatar_address address contact_no email ' })
        .populate({ path: 'buyer', select: 'name username avatar avatar_address address contact_no email ' })
        .populate({ path: 'owner', select: 'name username avatar avatar_address address contact_no email' })
        .skip(25 * page).limit(25)
        .cursor().eachAsync(async (p) => {
            var buyer = null
            if (p.buyer) {
                buyer = {
                    _id: p.buyer._id,
                    id: p.buyer._id,
                    name: p.buyer.name,
                    contact_no: p.buyer.contact_no,
                    email: p.buyer.email,
                }
            }

            var refurbishment_cost = 0
            if (parseFloat(p.refurbishment_cost) > 0) {
                refurbishment_cost = parseFloat(p.refurbishment_cost)
            }
            var purchase_price = 0
            if (p.purchase_price > 0) {
                purchase_price = p.purchase_price
            }

            var price = 0
            if (p.price > 0) {
                price = p.price
            }


            var revenue = 0;
            if (p.sold) {
                revenue = (parseFloat(purchase_price) + parseFloat(refurbishment_cost) + parseFloat(p.package_cost)) - price
            }



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
                buyer: buyer,
                logs: p.logs,
                price: price,
                purchase_price: purchase_price,
                refurbishment_cost: parseFloat(refurbishment_cost),
                package_cost: p.package_cost,
                revenue: revenue,
                sold: p.sold,
                package_sold: p.package_sold,
                user_verified: p.user_verified,
                buyer_verified: p.buyer_verified,
                admin_verified: p.admin_verified,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('LLL'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('LLL'),
            });
        });


    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: result
    })
});

router.post('/car/sold/', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: "required",
        price: "required"
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Car and Sold Price is required",
            responseData: {}
        })
    }
    else {
        var token = req.headers['x-access-token'];

        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var business = decoded.user;

        var loggedInDetails = await User.findById(decoded.user).exec();
        var sell = await CarSell.findOne({ car: req.body.car, sold: false, seller: business }).exec();

        if (sell) {
            var logs = sell.logs;
            var car = await Car.findById(sell.car).exec();
            if (car) {
                var buyer = await User.findById(req.body.buyer).exec();
                if (buyer) {
                    var otp = Math.floor(Math.random() * 90000) + 10000;
                    logs.push({
                        user: loggedInDetails._id,
                        name: loggedInDetails.name,
                        status: "BuyerAdded",
                        remark: "",
                        created_at: new Date(),
                        updated_at: new Date()
                    });

                    var data = {
                        buyer_otp: otp,
                        buyer: buyer._id,
                        logs: logs,
                        price: req.body.price,
                        purchase_price: car.purchase_price,
                        refurbishment_cost: car.refurbishment_cost,
                        user_verified: true,
                        admin_verified: true,
                        buyer_verified: false,
                        updated_at: new Date()
                    };

                    CarSell.findOneAndUpdate({ _id: sell._id }, { $set: data }, { new: false }, async function (err, doc) {
                        if (err) {
                            res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            event.otp(buyer.contact_no, otp);
                            Car.findOneAndUpdate({ _id: car._id }, {
                                $set: {
                                    price: req.body.price,
                                    publish: true,
                                    admin_approved: true,
                                    updated_at: new Date()
                                }
                            }, { new: false }, function (err, doc) {
                                if (err) {
                                    res.status(400).json({
                                        responseCode: 400,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    })
                                }
                                else {
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "OTP Sent to Buyer",
                                        responseData: {}
                                    })
                                }
                            });

                        }
                    });
                }
                else {
                    return res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Buyer not found",
                        responseData: {}
                    })
                }
            }
            else {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Car not found",
                    responseData: {}
                })
            }
        }
        else {
            return res.status(400).json({
                responseCode: 400,
                responseMessage: "Listing not found",
                responseData: {}
            })
        }
    }
});

router.post('/car/buyer/verification', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: "required",
        otp: "required"
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Car and OTP is required",
            responseData: { /*res: validation.errors.all()*/ }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var business = decoded.user;
        var loggedInDetails = await User.findById(decoded.user).exec();
        var sell = await CarSell.findOne({ car: req.body.car, sold: false, seller: business }).populate('seller').populate('buyer').populate('car').exec();

        if (sell) {
            var logs = sell.logs;

            if (sell.buyer_otp == req.body.otp) {
                logs.push({
                    user: loggedInDetails._id,
                    name: loggedInDetails.name,
                    status: "BuyerVerified",
                    remark: "",
                    created_at: new Date(),
                    updated_at: new Date()
                });

                var data = {
                    buyer_otp: null,
                    logs: logs,
                    buyer_verified: true,
                    sold: true,
                    updated_at: new Date()
                };

                CarSell.findOneAndUpdate({ _id: sell._id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {

                        Car.findOneAndUpdate({ _id: sell.car._id }, {
                            $set: {
                                user: sell.buyer,
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
                                });
                            }
                            else {
                                var updated = await CarSell.findById(sell._id).populate('car').exec();

                                var owner = sell.seller.referral_code;

                                var checkReferral = await Referral.find({ user: sell.buyer._id }).count().exec();
                                if (checkReferral == 0) {
                                    Referral.create({
                                        code: sell.seller.referral_code,
                                        owner: sell.seller._id,
                                        user: sell.buyer._id,
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    });
                                }

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "Car has been sold successfully",
                                    responseData: updated
                                })
                            }
                        });

                    }
                });
            }
            else {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "OTP not match",
                    responseData: {}
                })
            }
        }
        else {
            return res.status(400).json({
                responseCode: 400,
                responseMessage: "Listing not found",
                responseData: {}
            })
        }
    }
});

router.get('/sell/car/package/checksum', xAccessToken.token, async function (req, res, next) {
    var rules = {
        sell: "required"
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Car  is required",
            responseData: {}
        })
    }
    else {
        var token = req.headers['x-access-token'];

        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var business = decoded.user;
        var loggedInDetails = await User.findById(decoded.user).exec();
        var sell = await CarSell.findOne({ _id: req.query.sell, seller: business }).populate('seller').populate('car').exec();

        if (sell) {
            if (sell.car.package) {
                var discount = 0;
                if (sell.seller.partner) {
                    if (sell.seller.partner.partner == true) {
                        discount = sell.seller.partner.package_discount
                    }
                }
                var package = await Package.findById(sell.car.package).exec();
                var data = {
                    package: package._id,
                    package_cost: package.cost - discount,
                };

                CarSell.findOneAndUpdate({ _id: sell._id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "failure",
                            responseData: err
                        });
                    }
                    else {
                        var paramarray = {
                            MID: paytm_config.MID,
                            ORDER_ID: sell._id.toString(),
                            CUST_ID: sell.seller._id.toString(),
                            INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
                            CHANNEL_ID: "WAP",
                            TXN_AMOUNT: data.package_cost.toString(),
                            WEBSITE: paytm_config.WEBSITE,
                            CALLBACK_URL: paytm_config.CALLBACK + 'theia/paytmCallback?ORDER_ID=' + sell._id.toString(),
                            EMAIL: sell.seller.email,
                            MOBILE_NO: sell.seller.contact_no
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
                                    responseMessage: "Checksum generated",
                                    responseData: data
                                });
                            }
                        });
                    }
                });
            }
            else {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Package not found",
                    responseData: {}
                })
            }
        }
        else {
            return res.status(400).json({
                responseCode: 400,
                responseMessage: "Listing not found",
                responseData: {}
            })
        }
    }
});

router.get('/sell/car/package/transaction/', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var paramarray = new Object();
    var discount = 0;
    var sell = await CarSell.findOne({ _id: req.query.id, seller: business }).populate('seller').exec();
    var getUser = await User.findById(user).exec();
    var business = decoded.user;
    if (sell) {
        var package = await Package.findOne({ _id: sell.package }).exec();

        var paramarray = {
            MID: paytm_config.MID,
            ORDER_ID: sell._id.toString(),
            CUST_ID: sell.seller._id.toString(),
            INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
            CHANNEL_ID: "WAP",
            TXN_AMOUNT: sell.package_cost.toString(),
            WEBSITE: paytm_config.WEBSITE,
            CALLBACK_URL: paytm_config.CALLBACK + 'theia/paytmCallback?ORDER_ID=' + sell._id.toString(),
            EMAIL: sell.seller.email,
            MOBILE_NO: sell.seller.contact_no
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

                        CarSell.findOneAndUpdate({ _id: sell._id }, { $set: { package_sold: true } }, { new: false }, async function (err, doc) {
                            if (err) {
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Error Occurred",
                                    responseData: err
                                })
                            }
                            else {


                                var expired_at = new Date();
                                expired_at.setDate(expired_at.getDate() + package.validity);
                                var check = await UserPackage.find({ package: sell.package, category: "free", user: sell.buyer, car: sell.car }).count().exec();

                                if (check <= 0) {
                                    UserPackage.create({
                                        user: sell.buyer,
                                        car: sell.car,
                                        booking: null,
                                        name: package.name,
                                        business: "5bfec47ef651033d1c99fbca",
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

                                    if (package.cashback) {
                                        var point = {
                                            user: sell.buyer,
                                            activity: "coin",
                                            tag: "cashback",
                                            source: sell._id,
                                            sender: null,
                                            title: "",
                                            body: "",
                                            points: package.cashback,
                                            status: true
                                        }

                                        fun.addPoints(point)
                                    }

                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Your transaction has been successfully done",
                                        responseData: paytmRes
                                    })
                                }
                            }
                        });
                    }
                    else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Your transaction has been declined",
                            responseData: paytmRes
                        })
                    }

                }
            });
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Car Not Found",
            responseData: {}
        });
    }
});

router.get('/chat/leads/add', async function (req, res, next) {
    var business = "5bfec47ef651033d1c99fbca";
    var user = await User.findById(req.query.id).exec();
    if (user) {
        var checklead = await Lead.findOne({ contact_no: user.contact_no, business: business, "remark.status": { $in: ["Open", "Follow-Up"] } }).sort({ updated_at: -1 }).exec();

        if (checklead) {
            Lead.findOneAndUpdate({ _id: checklead._id }, {
                $set: {
                    "remark.status": "Open",
                    "type": "Booking",
                    "source": "Chat",
                    "remark.source": "Chat",
                    updated_at: new Date(),
                }
            }, { new: false }, async function (err, doc) {
            });
        }
        else {
            var data = {}
            var manager = business;

            var status = await LeadStatus.findOne({ status: "Open" }).exec();

            var managers = [];
            await Management.find({ business: business, role: "CRE" })
                .cursor().eachAsync(async (a) => {
                    var d = await Lead.find({ business: business, assignee: a.user }).count().exec();
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

            data.user = user._id;
            data.business = business;
            data.name = user.name;
            data.contact_no = user.contact_no;
            data.email = user.email;
            data.assignee = manager;
            data.type = "Chat";
            data.geometry = [0, 0];
            data.follow_up = null;
            data.source = "Chat",
                data.remark = {
                    status: req.body.status,
                    customer_remark: "",
                    assignee_remark: "",
                    assignee: manager,
                    color_code: "",
                    created_at: new Date(),
                    updated_at: new Date()
                };
            data.created_at = new Date();
            data.updated_at = new Date();

            Lead.create(data).then(async function (lead) {
                var count = await Lead.find({ _id: { $lt: l._id }, business: business }).count();
                var lead_id = count + 10000;

                Lead.findOneAndUpdate({ _id: l._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
                });

                var status = await LeadStatus.findOne({ status: "Open" }).exec();

                LeadRemark.create({
                    lead: lead._id,
                    type: "Chat",
                    source: req.headers['devicetype'],
                    status: req.body.status,
                    customer_remark: "",
                    assignee_remark: "",
                    assignee: manager,
                    color_code: "",
                    created_at: new Date(),
                    updated_at: new Date()
                }).then(function (newRemark) {
                    Lead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
                    })
                });

                event.assistance(lead, req.headers['tz'])

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {}
                })
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

async function packageDiscount(p, car, cat, s, lc, tz) {
    var labour_cost = lc;
    var package = await UserPackage.findOne({ _id: p, car: car, status: true }).exec();

    if (package) {
        var packageUsed = await PackageUsed.find({ package: p, user: package.user, label: s, car: car }).count().exec();
        var serverTime = moment.tz(new Date(), tz);

        var bar = package.created_at;
        bar.setDate(bar.getDate() + package.validity);
        bar = moment.tz(bar, tz)
        var baz = bar.diff(serverTime);

        if (baz > 0) {
            package.discount.forEach(async function (dis) {

                if (dis.for == "category") {
                    if (dis.label == cat) {
                        if (dis.type == "percent") {
                            if (!packageDiscountOn.includes(s)) {
                                labour_cost = lc - lc * (dis.discount / 100);
                            }
                        }
                        else if (dis.type == "fixed") {
                            if (!packageDiscountOn.includes(s)) {
                                labour_cost = lc - dis.discount

                            }
                        }
                        else {
                            if (!packageDiscountOn.includes(s)) {
                                labour_cost = lc - lc * (dis.discount / 100);

                            }
                        }
                    }
                }
                else if (dis.for == "specific") {
                    if (dis.label == s) {
                        if (dis.type == "percent") {
                            if (dis.limit > packageUsed) {
                                packageDiscountOn.push(s)
                                labour_cost = lc - lc * (dis.discount / 100);

                            }
                        }
                        else if (dis.type == "fixed") {
                            if (dis.limit > packageUsed) {
                                packageDiscountOn.push(s)
                                labour_cost = dis.discount;
                            }
                        }
                        else {
                            if (dis.limit > packageUsed) {
                                packageDiscountOn.push(s)
                                labour_cost = lc - dis.discount;
                            }
                        }
                    }
                }
            });
        }
    }
    return labour_cost;
}

async function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] == value) {
            return array[i];
        }
    }
    return array.length;
}

async function isLiked(user, post) {
    return new Promise((resolve, reject) => {
        Like.find({ user: user, post: post }).count().exec().then(function (like) {
            d = resolve(like)
        })
    })
};

async function getMedia(media) {
    var data = media;
    var result = _(data).groupBy(x => x.day).map((value, key) => ({ group: key, thumbnails: value })).value();
    return result;
}

async function price(value) {
    var val = Math.abs(value)
    if (val >= 10000000) {
        val = (val / 10000000).toFixed(2) + ' Cr*';
    }
    else if (val >= 100000) {
        val = (val / 100000).toFixed(2) + ' Lac*';
    }
    return val;
}

async function slugify(string) {
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

async function generateChecksum(param) {
    /* var str = ${transId}|${sellingCurrencyAmount}|${accountingCurrencyAmount}|${status}|${rkey}|${key};
     var generatedCheckSum = crypto.createHash('md5').update(str).digest("hex");
     return generatedCheckSum;*/
}

async function getPackageService(label) {
    var bookingService = [];
    if (label == "Wheel Alignment" || label == "Wheel Balancing (cost per tyre, weights excluded)") {
        var cond = { service: label };
    }
    else {
        var cond = { service: label };
    }

    await Service.findOne(cond).cursor().eachAsync(async (service) => {
        if (service) {
            bookingService.push({
                source: service._id,
                service: service.service,
                type: "services"
            });
        }
    });

    await Collision.findOne({ service: label }).cursor().eachAsync(async (service) => {
        if (service) {
            bookingService.push({
                source: service._id,
                service: service.service,
                description: service.description,
                type: "collision"
            });
        }
    });

    await Detailing.findOne({ service: label }).cursor().eachAsync(async (service) => {
        if (service) {
            bookingService.push({
                source: service._id,
                service: service.service,
                description: service.description,
                type: "detailing"
            });
        }

    });

    await Customization.findOne({ service: label }).cursor().eachAsync(async (service) => {
        if (service) {
            bookingService.push({
                source: service._id,
                service: service.service,
                description: service.description,
                type: "customization"
            });
        }
    });

    await Washing.findOne({ service: label }).cursor().eachAsync(async (service) => {
        if (service) {
            bookingService.push({
                source: service._id,
                service: service.service,
                description: service.description,
                type: "washing"
            });
        }
    });
    return bookingService;
}

async function getPackageDiscount(data) {
    var discount = {};
    if (data.package) {
        var package = await UserPackage.findOne({ _id: data.package }).exec();
        if (package) {
            var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
            var serverTime = moment.tz(new Date(), data.tz);

            var bar = package.created_at;
            bar.setDate(bar.getDate() + package.validity);
            bar = moment.tz(bar, data.tz)
            var baz = bar.diff(serverTime);

            if (baz > 0) {
                package.discount.forEach(async function (dis) {
                    if (dis.for == "category") {
                        if (dis.label == data.category) {
                            if (dis.type == "percent") {
                                if (!packageDiscountOn.includes(data.service)) {
                                    discount = {
                                        discount: dis.discount,
                                        discount_type: "percent"
                                    }
                                }
                            }
                            else {
                                if (!packageDiscountOn.includes(data.service)) {
                                    discount = {
                                        discount: dis.discount,
                                        discount_type: "price"
                                    }
                                }
                            }
                        }
                    }
                    else if (dis.for == "specific") {
                        if (dis.label == data.service) {
                            if (dis.type == "percent") {
                                if (dis.limit > packageUsed) {
                                    packageDiscountOn.push(data.service)
                                    discount = {
                                        discount: dis.discount,
                                        discount_type: "percent"
                                    }
                                }
                            }
                            else if (dis.type == "fixed") {
                                if (dis.limit > packageUsed) {
                                    packageDiscountOn.push(data.service)
                                    discount = {
                                        discount: dis.discount,
                                        discount_type: "fixed"
                                    }
                                }
                            }
                            else {
                                if (dis.limit > packageUsed) {
                                    packageDiscountOn.push(data.service)
                                    discount = {
                                        discount: dis.discount,
                                        discount_type: "price"
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
    }
    return discount;
}

function encrypt(text) {
    let iv = new Buffer(config.IV);
    let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(config.AES_KEY), config.IV);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypter(text) {
    let textParts = text.split(':');
    let iv = new Buffer(textParts.shift(), 'hex');
    let encryptedText = new Buffer(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(config.AES_KEY), config.IV);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

function decrypt(text) {
    let iv = new Buffer(config.IV);
    return decrypt(iv.toString('hex') + ':' + text)
}

function sha1(input) {
    return crypto.createHash('sha1').update(input).digest();
}

function passwordDeriveBytes(password, salt, iterations, len) {
    var key = Buffer.from(password + salt);
    for (var i = 0; i < iterations; i++) {
        key = sha1(key);
    }
    if (key.length < len) {
        var hx = passwordDeriveBytes(password, salt, iterations - 1, 20);
        for (var counter = 1; key.length < len; ++counter) {
            key = Buffer.concat([key, sha1(Buffer.concat([Buffer.from(counter.toString()), hx]))]);
        }
    }
    return Buffer.alloc(len, key);
}

module.exports = router