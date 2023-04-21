var mongoose = require('mongoose'),
    express = require('express'),
    { ObjectId } = require('mongodb').ObjectID,
    router = express.Router(),
    config = require('../../../config'),
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
    crypto = require('crypto'),
    aes256 = require('aes256');



global.packageDiscountOn = [];

var paytm_config = require('../../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../../paytm/checksum');
var querystring = require('querystring');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});

const xAccessToken = require('../../../middlewares/xAccessToken');
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
const Product = require('../../../models/product');
const Service = require('../../../models/service');
const Insurance = require('../../../models/insurance');
const Diagnosis = require('../../../models/diagnosis');
const Customization = require('../../../models/customization');
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
const LeadRemark = require('../../../models/leadRemark');
const LeadStatus = require('../../../models/leadStatus');
const Package = require('../../../models/package');
const UserPackage = require('../../../models/userPackage');
const PackageUsed = require('../../../models/packageUsed');
const Management = require('../../../models/management');
const LeadManagement = require('../../../models/leadManagement');
const ActivityLog = require('../../../models/activityLog');
const TransactionLog = require('../../../models/transactionLog');
const DriverVerification = require('../../../models/driverVerification');
const Gallery = require('../../../models/gallery');
const Detailing = require('../../../models/detailing');

var secret = config.secret;

/**
    * [New User API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/
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


router.get('/home', async function (req, res, next) {
    var packages = [];
    await Collision.find({})
        .cursor().eachAsync(async (service) => {

            var variant = await Variant.findOne({ model: service.model }).exec();
            var length = 0;
            if (variant) {
                length = parseInt(variant.specification.length)
            }
            if (length < 4267) {
                packages.push({
                    model: service.model,
                    for: service.for,
                    package: service.package,
                    service: service.service,
                    description: service.description,
                    labour_cost: service.labour_cost,
                    part_cost: service.part_cost,
                    mrp: service.mrp,
                    cost: service.cost,
                    parts: service.parts,
                    unit: "",
                    quantity: "",
                    is_common: false,
                    doorstep: false,
                });
            }
        });

    res.json(packages)

    /*res.json(aes256.encrypt(config.encyp,"welcome")) */
    /* var coupons = [];
     var date =   new Date();
     var from = new Date(date.getFullYear(), date.getMonth(), 1);
     var to = new Date(date.getFullYear(), date.getMonth(),  date.getDate()+260);*/
    /*for(var i= 0; i<250; i++)
    {
        var c = shortid.generate();
        Coupon.create({ 
            "code" : "RP"+c.replace(/_|-/g, "").toUpperCase(), 
            "limit" : 1, 
            "price_limit" : 0, 
            "for" : "specific", 
            "type" : "fixed", 
            "label" : "Exterior Rubbing Polishing", 
            "discount" : 1999, 
            "campaign" : "RP_March",
            "created_at" : from, 
            "expired_at" : to
        });
    }
    res.json("RP_March")*/
    //res.json(await Coupon.find({"campaign" : "RP_March"}).exec())
});



router.get('/get', async function (req, res, next) {
    /*  var packages = [];
   
      await Model.find({})
      .populate('automaker')
      .cursor().eachAsync(async(model) => {
          var variant = await Variant.findOne({model: model._id}).exec();
          var collision = await Collision.findOne({model: model._id}).count().exec();
          if(collision==0){
              for(var i = 0; i <17;i++){
                  packages.push({
                      automaker: model.automaker._id,
                      maker: model.automaker.maker,
                      for: model.value,
                      model: model._id,
                      length: parseInt(variant.specification.length)
                  });
              }
          } 
      });
  
  
      res.json(packages)*/

    /*var key = config.key
       
    var password = key;
    var plaintext = '437217';
    var iv = '92f8ae9c6c9947b9';

    //var key = crypto.pbkdf2Sync(password, '', 100, 32, 'sha1'); // How it should be
    var key = passwordDeriveBytes(password, '', 100, 32); // How it is
    // console.log(key.toString('hex'));

    var cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(iv));
    var decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv));

    var part1 = cipher.update(plaintext, 'utf8');
    var part2 = cipher.final();
    var encrypted = Buffer.concat([part1, part2]).toString('hex');

    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    //var decrypted = decipher.update('RxKWzl5PrACwY0Za+Z64Fg==', 'base64', 'utf8');
    decrypted += decipher.final();

    // console.log('original  :', plaintext); 
    // console.log('encrypted :', encrypted);
    // console.log('decrypted :', decrypted);*/

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

        var type = "user";
        if (req.query.type == "driver") {
            type = "driver"
        }
        else if (req.query.type == "business") {
            type = "business"
        }
        else {
            type = "user"
        }

        var username = req.query.username;
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
            var data = {
                _id: user._id,
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                contact_no: user.contact_no,
                avatar_address: user.avatar_address,
                avatar: user.avatar,
                account_info: user.account_info
            };

            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: data
            })
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User not found",
                responseData: {}
            })
        }
    }
});

router.get('/us/', async function (req, res, next) {
    var models = []
    var loss_models = []
    await Model.find({}).cursor().eachAsync(async (model) => {
        var variant = await Variant.findOne({ model: model._id }).exec();
        for (var i = 0; i <= 24; i++) {
            models.push({
                id: model._id,
                model: model.model,
                length: variant.specification.length
            })
        }
    })

    res.json(models)
});

/**
    * [New User API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/new/', async function (req, res, next) {
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
                var rand = Math.ceil((Math.random() * 100000) + 1);

                var email = req.body.name;

                var referral_code = req.body.referral_code;
                req.body.username = req.body.username.toLowerCase();


                req.body.referral_code = name.toUpperCase() + "" + rand;
                //req.body.referral_code = shortid.generate();
                req.body.geometry = [0, 0];
                req.body.device = [];
                req.body.otp = Math.ceil(Math.random() * 90000) + 10000;

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
            PostMedia.findOneAndUpdate({ _id: req.body.media[m].id }, { $set: media }, { new: true }, function (err, doc) { });
        }

        for (var i = 0; i < tags.length; i++) {
            Hashtag.create({ post: post._id, hashtag: tags[i], created_at: new Date(), updated_at: new Date() }).then(async function (hashtag) { });
        }

        var point = {
            user: user,
            activity: "coin",
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
        Comment.findOneAndUpdate({ _id: req.query.id, user: user }, { $set: { status: false } }, async function (err, doc) { });
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

        res.status(200).json({
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

        res.status(200).json({
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


        res.status(200).json({
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
            Owner: 250,
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
    var data = [];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    if (req.query.car) {
        var car = await Car.findOne({ _id: req.query.car, user: user }).exec();
        var variant = await Variant.findOne({ _id: car.variant }).exec();
        var carLength = parseInt(variant.specification.length);
        await BookingCategory.find({})
            .sort({ position: 1 })
            .cursor().eachAsync(async (d) => {

                var enable = true;
                if (d.tag == "services" && carLength < 4267) {
                    enable = false;
                }

                if (d.tag == "collision" && carLength < 4267) {
                    enable = false;
                }

                if (d.tag == "package" && carLength < 4267) {
                    enable = false;
                }

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

        // console.log(data)

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        });
    }
    else {
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
                    features: d.features
                })
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        });
    }
});

/**
 * [Get Booking Services API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/booking/category/feature/get', xAccessToken.token, async function (req, res, next) {
    var variant = await Variant.findOne({ _id: car.variant }).exec();
    var carLength = parseInt(variant.specification.length);

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

        var car = await Car.findOne({ _id: req.body.car, user: user }).exec();
        var previous_booking = await Booking.findOne({ user: user, car: req.body.car, is_services: true }).sort({ created_at: -1 }).exec();

        if (car) {
            var variant = await Variant.findOne({ _id: car.variant }).exec();
            var carLength = parseInt(variant.specification.length);
            // console.log(carLength)

            if (req.body.type == "services") {
                var gallery = {};
                if (carLength >= 4267 && req.body.business == "5bfec47ef651033d1c99fbca") {

                    if (car.fuel_type == "Petrol" || car.fuel_type == "Diesel") {
                        await Service.find({ model: car.model, fuel_type: car.fuel_type, })
                            .cursor().eachAsync(async (service) => {

                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                                var serviceName = service.service;
                                if (service.mileage) {
                                    var serviceName = service.service + " (" + service.mileage + " KM)"
                                }

                                gallery = await Gallery.find({ source: service._id }).exec();

                                packages.push({
                                    automaker: service.automaker,
                                    model: service.model,
                                    for: service.for,
                                    package: service.package,
                                    service: serviceName,
                                    description: service.description,
                                    original_labour_cost: Math.ceil(service.labour_cost),
                                    labour_cost: Math.ceil(labour_cost),
                                    part_cost: Math.ceil(service.part_cost),
                                    mrp: Math.ceil(service.mrp),
                                    cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                                    originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                                    is_common: service.is_common,
                                    inclusions: service.inclusions,
                                    fuel_type: service.fuel_type,
                                    doorstep: service.doorstep,
                                    unit: service.unit,
                                    quantity: service.quantity,
                                    type: "services",
                                    gallery: gallery,
                                    id: service.id,
                                    _id: service._id,
                                })
                            });

                        await Service.find({ model: car.model, fuel_type: "" }).cursor().eachAsync(async (service) => {

                            var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                            var gallery = await Gallery.find({ source: service._id }).exec();

                            packages.push({
                                automaker: service.automaker,
                                model: service.model,
                                for: service.for,
                                package: service.package,
                                service: service.service,
                                description: service.description,
                                labour_cost: Math.ceil(labour_cost),
                                part_cost: Math.ceil(service.part_cost),
                                mrp: Math.ceil(service.mrp),
                                cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                                originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                                is_common: service.is_common,
                                inclusions: service.inclusions,
                                fuel_type: service.fuel_type,
                                doorstep: service.doorstep,
                                unit: service.unit,
                                quantity: service.quantity,
                                type: "services",
                                gallery: gallery,
                                id: service.id,
                                _id: service._id
                            })
                        });

                        await Service.find({ is_common: true }).cursor().eachAsync(async (service) => {
                            var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                            gallery = await Gallery.find({ source: service._id }).exec();

                            packages.push({
                                automaker: service.automaker,
                                model: service.model,
                                for: service.for,
                                package: service.package,
                                service: service.service,
                                description: service.description,
                                labour_cost: Math.ceil(labour_cost),
                                part_cost: Math.ceil(service.part_cost),
                                mrp: Math.ceil(service.mrp),
                                cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                                originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                                is_common: service.is_common,
                                inclusions: service.inclusions,
                                fuel_type: service.fuel_type,
                                doorstep: service.doorstep,
                                unit: service.unit,
                                quantity: service.quantity,
                                type: "services",
                                gallery: gallery,
                                id: service.id,
                                _id: service._id
                            })
                        });

                        packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                        packageDiscountOn = []
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Please hold on, we're about to update the database of discontinued cars.",
                            responseData: packages,
                        });
                    }
                    else {
                        var gallery = {};
                        await Service.find({ model: car.model, fuel_type: 'Diesel' })
                            .cursor().eachAsync(async (service) => {
                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                                var serviceName = service.service;
                                if (service.mileage) {
                                    var serviceName = service.service + " (" + service.mileage + " KM)"
                                }

                                gallery = await Gallery.find({ source: service._id }).exec();

                                packages.push({
                                    automaker: service.automaker,
                                    model: service.model,
                                    for: service.for,
                                    package: service.package,
                                    service: serviceName,
                                    description: service.description,
                                    labour_cost: Math.ceil(labour_cost),
                                    part_cost: Math.ceil(service.part_cost),
                                    mrp: Math.ceil(service.mrp),
                                    cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                                    originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                                    is_common: service.is_common,
                                    inclusions: service.inclusions,
                                    fuel_type: service.fuel_type,
                                    doorstep: service.doorstep,
                                    unit: service.unit,
                                    quantity: service.quantity,
                                    type: "services",
                                    gallery: gallery,
                                    id: service.id,
                                    _id: service._id
                                })
                            });

                        await Service.find({ is_common: true }).cursor().eachAsync(async (service) => {
                            var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                            var gallery = await Gallery.find({ source: service._id }).exec();

                            packages.push({
                                automaker: service.automaker,
                                model: service.model,
                                for: service.for,
                                package: service.package,
                                service: service.service,
                                description: service.description,
                                labour_cost: Math.ceil(labour_cost),
                                part_cost: Math.ceil(service.part_cost),
                                mrp: Math.ceil(service.mrp),
                                cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                                originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                                is_common: service.is_common,
                                inclusions: service.inclusions,
                                fuel_type: service.fuel_type,
                                doorstep: service.doorstep,
                                unit: service.unit,
                                quantity: service.quantity,
                                type: "services",
                                gallery: gallery,
                                id: service.id,
                                _id: service._id
                            })
                        });

                        await Service.find({ model: car.model, $or: [{ service: "Wheel Alignment" }, { service: "Wheel Balancing (cost per tyre, weights excluded)" }] }).cursor().eachAsync(async (service) => {
                            var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                            gallery = await Gallery.find({ source: service._id }).exec();

                            packages.push({
                                automaker: service.automaker,
                                model: service.model,
                                for: service.for,
                                package: service.package,
                                service: service.service,
                                description: service.description,
                                labour_cost: Math.ceil(labour_cost),
                                part_cost: Math.ceil(service.part_cost),
                                mrp: Math.ceil(service.mrp),
                                cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                                originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                                is_common: service.is_common,
                                inclusions: service.inclusions,
                                fuel_type: service.fuel_type,
                                doorstep: service.doorstep,
                                unit: service.unit,
                                quantity: service.quantity,
                                type: "services",
                                gallery: gallery,
                                id: service.id,
                                _id: service._id
                            })
                        });

                        packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();
                        packageDiscountOn = []
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Please hold on, we're about to update the database of discontinued cars.",
                            responseData: packages,
                        });
                    }
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "The selected service is not applicable to your car. Please choose a different service or change business",
                        responseData: [],
                    });
                }
            }
            else if (req.body.type == "collision") {
                if (carLength >= 4267 && req.body.business == "5bfec47ef651033d1c99fbca") {
                    var gallery = {};
                    await Collision.find({ model: car.model }).cursor().eachAsync(async (service) => {
                        // console.log(service)
                        var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                        gallery = await Gallery.find({ source: service._id }).exec();

                        packages.push({
                            model: service.model,
                            model_name: service.model_name,
                            service: service.service,
                            unit: service.unit,
                            icon: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/icon/" + _.camelCase(service.service) + ".png",
                            description: service.description,
                            mrp: Math.ceil(service.mrp),
                            labour_cost: Math.ceil(labour_cost),
                            part_cost: Math.ceil(service.part_cost),
                            cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                            originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                            paint: service.paint,
                            package: service.package,
                            id: service.id,
                            doorstep: service.doorstep,
                            unit: service.unit,
                            quantity: service.quantity,
                            gallery: gallery,
                            type: "collision",
                            _id: service._id
                        })
                    });

                    packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                    packageDiscountOn = []
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Please hold on, we're about to update the database of discontinued cars.",
                        responseData: packages
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "The selected service is not applicable to your car. Please choose a different service or change business",
                        responseData: [],
                    });
                }
            }
            else if (req.body.type == "washing") {
                if (req.body.business == "5bfec47ef651033d1c99fbca") {
                    var gallery = {};
                    await Washing.find({ model: car.model }).cursor().eachAsync(async (service) => {
                        var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                        gallery = await Gallery.find({ source: service._id }).exec();

                        packages.push({
                            automaker: service.automaker,
                            brand: service.brand,
                            service: service.service,
                            description: service.description,
                            mrp: Math.ceil(service.mrp),
                            labour_cost: Math.ceil(labour_cost),
                            part_cost: Math.ceil(service.part_cost),
                            type: "washing",
                            cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                            originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                            paint: service.paint,
                            unit: service.unit,
                            quantity: service.quantity,
                            id: service.id,
                            gallery: gallery,
                            doorstep: service.doorstep,
                            _id: service._id
                        });
                    });

                    await Package.find({ category: "washing", automakers: car.automaker }).cursor().eachAsync(async (service) => {
                        gallery = await Gallery.find({ source: service._id }).exec();
                        packages.push({
                            service: service.name + ' - (Package)',
                            description: service.description,
                            mrp: 0,
                            discount: service.discount,
                            labour_cost: service.cost,
                            part_cost: 0,
                            type: "package",
                            cost: service.cost,
                            id: service.id,
                            _id: service._id,
                            doorstep: service.doorstep,
                            label: service.label,
                            gallery: gallery,
                            validity: service.validity,
                        });
                    });
                    packageDiscountOn = []
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Please hold on, we're about to update the database of discontinued cars.",
                        responseData: packages
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "The selected service is not applicable to your car. Please choose a different service or change business",
                        responseData: [],
                    });
                }
            }
            else if (req.body.type == "detailing") {
                if (req.body.business == "5bfec47ef651033d1c99fbca") {
                    var gallery = {};
                    await Detailing.find({ model: car.model }).cursor().eachAsync(async (service) => {
                        var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                        gallery = await Gallery.find({ source: service._id }).exec();

                        packages.push({
                            automaker: service.automaker,
                            brand: service.brand,
                            service: service.service,
                            package: service.package,
                            description: service.description,
                            mrp: Math.ceil(service.mrp),
                            labour_cost: Math.ceil(labour_cost),
                            part_cost: Math.ceil(service.part_cost),
                            type: "detailing",
                            cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                            originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                            quantity: service.quantity,
                            unit: service.unit,
                            gallery: gallery,
                            id: service.id,
                            doorstep: service.doorstep,
                            _id: service._id
                        });
                    });

                    packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                    packageDiscountOn = []
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Please hold on, we're about to update the database of discontinued cars.",
                        responseData: packages
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "The selected service is not applicable to your car. Please choose a different service or change business",
                        responseData: [],
                    });
                }
            }
            else if (req.body.type == "customization") {
                if (/*carLength>=3960 && */req.body.business == "5bfec47ef651033d1c99fbca") {
                    var gallery = {};
                    await Customization.find({ model: car.model }).cursor().eachAsync(async (service) => {
                        var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                        gallery = await Gallery.find({ source: service._id }).exec();

                        packages.push({
                            automaker: service.automaker,
                            brand: service.brand,
                            service: service.service,
                            package: service.package,
                            description: service.description,
                            mrp: Math.ceil(service.mrp),
                            labour_cost: Math.ceil(labour_cost),
                            part_cost: Math.ceil(service.part_cost),
                            type: "customization",
                            cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                            originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                            quantity: service.quantity,
                            unit: service.unit,
                            gallery: gallery,
                            id: service.id,
                            doorstep: service.doorstep,
                            _id: service._id
                        });
                    });

                    packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                    packageDiscountOn = []
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Please hold on, we're about to update the database of discontinued cars.",
                        responseData: packages
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "The selected service is not applicable to your car. Please choose a different service or change business",
                        responseData: [],
                    });
                }
            }
            else if (req.body.type == "product") {
                if (/*carLength>=3960 && */req.body.business == "5bfec47ef651033d1c99fbca") {
                    var gallery = {};
                    await Product.find({ is_common: true }).cursor().eachAsync(async (service) => {
                        var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, req.body.type, service.service, Math.ceil(service.labour_cost), req.headers['tz']));

                        gallery = await Gallery.find({ source: service._id }).exec();

                        packages.push({
                            automaker: service.automaker,
                            model: service.model,
                            for: service.for,
                            package: service.category,
                            service: service.product + " (" + service.quantity + " " + service.unit + ")",
                            quantity: service.quantity,
                            unit: service.unit,
                            additional: service.additional,
                            description: service.description,
                            labour_cost: Math.ceil(labour_cost),
                            part_cost: Math.ceil(service.part_cost),
                            mrp: Math.ceil(service.mrp),
                            cost: Math.ceil(service.part_cost) + Math.ceil(labour_cost),
                            originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                            is_common: service.is_common,
                            inclusions: service.inclusions,
                            fuel_type: service.fuel_type,
                            doorstep: service.doorstep,
                            type: "product",
                            gallery: gallery,
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
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "The selected service is not applicable to your car. Please choose a different service or change business",
                        responseData: [],
                    });
                }
            }
            else if (req.body.type == "package") {
                if (carLength >= 4267 && req.body.business == "5bfec47ef651033d1c99fbca") {
                    var gallery = {};
                    await Package.find({ label: "special" }).cursor().eachAsync(async (service) => {
                        var serverTime = moment.tz(new Date(), req.headers['tz']);

                        var bar = service.created_at;
                        bar.setDate(bar.getDate() + service.validity);

                        var e = bar;
                        bar = moment.tz(bar, req.headers['tz'])

                        var baz = bar.diff(serverTime);

                        var check = await UserPackage.find({ user: user, package: service._id, car: req.body.car }).count().exec();
                        if (check <= 0) {
                            if (baz > 0) {
                                gallery = await Gallery.find({ source: service._id }).exec();
                                if (service.category == "addOn") {
                                    packages.push({
                                        service: service.name,
                                        description: service.description,
                                        mrp: 0,
                                        discount: service.discount,
                                        labour_cost: service.cost,
                                        part_cost: 0,
                                        type: "addOn",
                                        cost: service.cost,
                                        id: service.id,
                                        _id: service._id,
                                        label: service.label,
                                        doorstep: false,
                                        validity: service.validity,
                                        gallery: gallery,
                                        doorstep: service.doorstep,
                                        expired_at: moment(service.expired_at).tz(req.headers['tz']).format('ll')
                                    });
                                }
                                else {
                                    packages.push({
                                        service: service.name + ' - (Package)',
                                        description: service.description,
                                        mrp: 0,
                                        discount: service.discount,
                                        labour_cost: service.cost,
                                        part_cost: 0,
                                        type: "package",
                                        cost: service.cost,
                                        id: service.id,
                                        _id: service._id,
                                        label: service.label,
                                        doorstep: false,
                                        validity: service.validity,
                                        gallery: gallery,
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
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "The selected service is not applicable to your car. Please choose a different service or change business",
                        responseData: [],
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
 * [Time Slot API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/booking/time-slot/', xAccessToken.token, async function (req, res, next) {
    var slots = [];
    var date = new Date(new Date(req.query.date).setHours(0, 0, 0, 0));
    var next = new Date(new Date(req.query.date).setHours(0, 0, 0, 0));
    next.setDate(date.getDate() + 1);

    var slot1 = await Booking.find({
        time_slot: "9AM - 12PM",
        is_services: true,
        business: req.query.business,
        date: { $gte: date, $lt: next },
        status: { $ne: "Inactive" },
        $and: [{
            status: { $ne: "Rejected" }
        },
        {
            status: { $ne: "Cancelled" }
        },
        {
            status: { $ne: "Completed" }
        }],
    }).count().exec();

    var slot2 = await Booking.find({
        time_slot: "12PM - 3PM",
        is_services: true,
        business: req.query.business,
        date: { $gte: date, $lt: next },
        status: { $ne: "Inactive" },
        $and: [{
            status: { $ne: "Rejected" }
        },
        {
            status: { $ne: "Cancelled" }
        },
        {
            status: { $ne: "Completed" }
        }],
    }).count().exec();

    var slot3 = await Booking.find({
        time_slot: "3PM - 6PM",
        is_services: true,
        business: req.query.business,
        date: { $gte: date, $lt: next },
        status: { $ne: "Inactive" },
        $and: [{
            status: { $ne: "Rejected" }
        },
        {
            status: { $ne: "Cancelled" }
        },
        {
            status: { $ne: "Completed" }
        }],
    }).count().exec();


    if (slot1 > 7) {
        slots.push({
            slot: "9AM - 12PM",
            count: slot1,
            status: false
        });
    }
    else {
        slots.push({
            slot: "9AM - 12PM",
            count: slot1,
            status: true
        });
    }

    if (slot2 > 7) {
        slots.push({
            slot: "12PM - 3PM",
            count: slot2,
            status: false
        });
    }
    else {
        slots.push({
            slot: "12PM - 3PM",
            count: slot2,
            status: true
        });
    }

    if (slot3 > 7) {
        slots.push({
            slot: "3PM - 6PM",
            count: slot3,
            status: false
        });
    }
    else {
        slots.push({
            slot: "3PM - 6PM",
            count: slot3,
            status: true
        });
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: date + " " + next,
        responseData: slots
    })

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
        }); 0
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
        var customer_requirements = [];

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
            var advisor = null
        }

        if (checkCar) {
            var checkVendor = await User.findOne({ '_id': req.body.business }).exec();
            if (checkVendor) {
                for (var i = 0; i < services.length; i++) {
                    if (services[i].type == "services") {
                        await Service.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                            if (service) {
                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, services[i].type, service.service, service.labour_cost));

                                if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                                    var quantity = 1
                                }
                                else {
                                    var quantity = parseInt(services[i].quantity)
                                }

                                var serviceName = service.service;

                                /*if(service.mileage)
                                {
                                    var serviceName = service.service+" ("+service.mileage+" KM)"
                                }*/

                                bookingService.push({
                                    source: service._id,
                                    service: service.service,
                                    mileage: service.mileage,
                                    parts: service.parts,
                                    description: service.description,
                                    quantity: quantity,
                                    cost: (Math.ceil(labour_cost) + Math.ceil(service.part_cost)) * quantity,
                                    labour_cost: Math.ceil(labour_cost),
                                    part_cost: Math.ceil(service.part_cost),
                                    type: "services"
                                });
                                part_cost = Math.ceil(part_cost) + (Math.ceil(service.part_cost)) * quantity;
                                labourCost = Math.ceil(labourCost) + (Math.ceil(labour_cost)) * quantity;
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
                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, services[i].type, service.service, Math.ceil(service.labour_cost)));

                                if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                                    var quantity = 1
                                }
                                else {
                                    var quantity = parseInt(services[i].quantity)
                                }

                                bookingService.push({
                                    source: service._id,
                                    service: service.service,
                                    description: service.description,
                                    quantity: quantity,
                                    cost: (Math.ceil(labour_cost) + Math.ceil(service.part_cost)) * quantity,
                                    labour_cost: Math.ceil(labour_cost),
                                    part_cost: Math.ceil(service.part_cost),
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

                    else if (services[i].type == "customization") {
                        await Customization.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                            if (service) {
                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, services[i].type, service.service, Math.ceil(service.labour_cost)));

                                if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                                    var quantity = 1
                                }
                                else {
                                    var quantity = parseInt(services[i].quantity)
                                }

                                bookingService.push({
                                    source: service._id,
                                    service: service.service,
                                    description: service.description,
                                    quantity: quantity,
                                    cost: (Math.ceil(labour_cost) + Math.ceil(service.part_cost)) * quantity,
                                    labour_cost: Math.ceil(labour_cost),
                                    part_cost: Math.ceil(service.part_cost),
                                    type: "customization"
                                });
                                part_cost = Math.ceil(part_cost) + (Math.ceil(service.part_cost)) * quantity;
                                labourCost = Math.ceil(labourCost) + (Math.ceil(labour_cost)) * quantity;
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

                    else if (services[i].type == "detailing") {
                        await Detailing.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                            if (service) {
                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, services[i].type, service.service, Math.ceil(service.labour_cost)));

                                if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                                    var quantity = 1
                                }
                                else {
                                    var quantity = parseInt(services[i].quantity)
                                }

                                bookingService.push({
                                    source: service._id,
                                    service: service.service,
                                    description: service.description,
                                    quantity: quantity,
                                    cost: (Math.ceil(labour_cost) + Math.ceil(service.part_cost)) * quantity,
                                    labour_cost: Math.ceil(labour_cost),
                                    part_cost: Math.ceil(service.part_cost),
                                    type: "detailing"
                                });
                                part_cost = Math.ceil(part_cost) + (Math.ceil(service.part_cost)) * quantity;
                                labourCost = Math.ceil(labourCost) + (Math.ceil(labour_cost)) * quantity;
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
                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, services[i].type, service.service, Math.ceil(service.labour_cost)));

                                if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                                    var quantity = 1
                                }
                                else {
                                    var quantity = parseInt(services[i].quantity)
                                }

                                bookingService.push({
                                    source: service._id,
                                    service: service.service,
                                    description: service.description,
                                    quantity: quantity,
                                    cost: (Math.ceil(labour_cost) + Math.ceil(service.part_cost)) * quantity,
                                    labour_cost: Math.ceil(labour_cost),
                                    part_cost: Math.ceil(service.part_cost),
                                    type: "washing"
                                });
                                part_cost = Math.ceil(part_cost) + (Math.ceil(service.part_cost)) * quantity;
                                labourCost = Math.ceil(labourCost) + (Math.ceil(labour_cost)) * quantity;
                                if (req.body.convenience == "Doorstep") {
                                    doorstep = false;
                                }
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

                    else if (services[i].type == "product") {
                        await Product.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                            if (service) {
                                var labour_cost = await q.all(packageDiscount(req.body.package, req.body.car, services[i].type, service.service, Math.ceil(service.labour_cost)));

                                if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                                    var quantity = 1
                                }
                                else {
                                    var quantity = parseInt(services[i].quantity)
                                }

                                bookingService.push({
                                    source: service._id,
                                    service: service.product,
                                    description: service.description,
                                    quantity: quantity,
                                    cost: (Math.ceil(labour_cost) + Math.ceil(service.part_cost)) * quantity,
                                    labour_cost: Math.ceil(labour_cost),
                                    part_cost: Math.ceil(service.part_cost),
                                    type: "product"
                                });
                                part_cost = Math.ceil(part_cost) + (Math.ceil(service.part_cost)) * quantity;
                                labourCost = Math.ceil(labourCost) + (Math.ceil(labour_cost)) * quantity;
                            }
                            else {
                                res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Product Not Found",
                                    responseData: {},
                                });
                            }
                        });
                    }

                    else if (services[i].type == "addOn") {
                        req.body.is_services = true;
                        is_services = true;
                        await Package.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                            if (service) {
                                if (service.category == "addOn") {

                                    bookingService.push({
                                        source: service._id,
                                        service: service.name,
                                        description: service.description,
                                        cost: Math.ceil(service.cost),
                                        labour_cost: Math.ceil(service.cost),
                                        part_cost: 0,
                                        type: "addOn"
                                    });

                                    part_cost = Math.ceil(part_cost) + 0;
                                    labourCost = Math.ceil(labourCost) + Math.ceil(service.cost);
                                }
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
                                if (service.category == "addOn") {
                                    req.body.is_services = true;
                                    is_services = true;
                                    bookingService.push({
                                        source: service._id,
                                        service: service.name,
                                        description: service.description,
                                        cost: Math.ceil(service.cost),
                                        labour_cost: Math.ceil(service.cost),
                                        part_cost: 0,
                                        type: "addOn"
                                    });

                                    part_cost = Math.ceil(part_cost) + 0;
                                    labourCost = Math.ceil(labourCost) + Math.ceil(service.cost);
                                }
                                else {
                                    is_services = false;
                                    bookingService.push({
                                        source: service._id,
                                        service: service.name,
                                        description: service.description,
                                        cost: Math.ceil(service.cost),
                                        labour_cost: Math.ceil(service.cost),
                                        part_cost: 0,
                                        type: "package"
                                    });

                                    part_cost = Math.ceil(part_cost) + 0;
                                    labourCost = Math.ceil(labourCost) + Math.ceil(service.cost);
                                }
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


                var pick_up_charges = 0;

                if (req.body.convenience) {
                    if (req.body.convenience != "Self Drop") {
                        var checkTotal = part_cost + labourCost;
                        if (checkTotal <= checkVendor.business_info.pick_up_limit) {
                            pick_up_charges = Math.ceil(checkVendor.business_info.pick_up_charges);
                        }
                    }
                }

                // console.log(pick_up_charges)

                if (doorstep) {
                    if (bookingService.length > 0) {
                        if (req.body.requirements) {
                            customer_requirements.push({
                                requirement: req.body.requirements,
                            });
                        }

                        var paid_total = part_cost + labourCost + pick_up_charges;

                        var payment = {
                            payment_mode: req.body.payment_mode,
                            payment_status: "Pending",
                            discount_type: "",
                            coupon: "",
                            coupon_type: "",
                            discount: 0,
                            discount_total: 0,
                            terms: checkVendor.business_info.terms,
                            pick_up_limit: checkVendor.business_info.pick_up_limit,
                            pick_up_charges: pick_up_charges,
                            part_cost: Math.ceil(part_cost),
                            labour_cost: Math.ceil(labourCost),
                            paid_total: Math.ceil(paid_total),
                            total: Math.ceil(part_cost) + Math.ceil(labourCost),
                            discount_applied: false,
                            transaction_id: "",
                            transaction_date: "",
                            transaction_status: "",
                            transaction_response: ""
                        }

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




                        var lastBooking = await Booking.findOne({ user: user, status: "Inactive" }).sort({ created_at: -1 }).exec();

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
                                due: null,
                                address: req.body.address,
                                is_services: req.body.is_services,
                                created_at: new Date(),
                                updated_at: new Date()
                            };

                            // console.log("old")
                            // console.log(data)

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
                                booking_no: Math.round(+new Date() / 1000) + Math.floor((Math.random() * 9999) + 1),
                                date: date,
                                time_slot: req.body.time_slot,
                                convenience: req.body.convenience,
                                status: "Inactive",
                                payment: payment,
                                address: req.body.address,
                                is_services: is_services,
                                created_at: new Date(),
                                updated_at: new Date()
                            };

                            // console.log(data)

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
                            responseMessage: "Booking service not found!",
                            responseData: {},
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
        var checkCar = await Car.findOne({ '_id': checkPackage.car, user: user }).exec();
        var checkVendor = await User.findOne({ '_id': checkPackage.business }).exec();

        if (checkCar && checkPackage) {
            if (req.body.label == "Wheel Alignment" || req.body.label == "Wheel Balancing (cost per tyre, weights excluded)") {
                var cond = { service: req.body.label, model: checkCar.model };
            } else {
                var cond = { service: req.body.label, model: checkCar.model, fuel_type: checkCar.fuel_type };
            }
            await Service.find(cond).cursor().eachAsync(async (service) => {
                if (service) {
                    var labour_cost = await q.all(packageDiscount(req.body.package, checkCar._id, "services", service.service, Math.ceil(service.labour_cost)));

                    var serviceName = service.service;
                    if (service.mileage) {
                        var serviceName = service.service + " (" + service.mileage + " KM)"
                    }

                    bookingService.push({
                        source: service._id,
                        service: serviceName,
                        parts: Math.ceil(service.parts),
                        description: service.description,
                        cost: Math.ceil(labour_cost) + Math.ceil(service.part_cost),
                        labour_cost: Math.ceil(labour_cost),
                        part_cost: Math.ceil(service.part_cost),
                        type: "services"
                    });

                    part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                    labourCost = Math.ceil(labourCost) + Math.ceil(labour_cost);
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Service Not Found",
                        responseData: {},
                    });
                }
            });

            await Collision.find({ service: req.body.label, model: checkCar.model }).cursor().eachAsync(async (service) => {
                if (service) {
                    var labour_cost = await q.all(packageDiscount(req.body.package, checkCar._id, "collision", service.service, Math.ceil(service.labour_cost)));

                    bookingService.push({
                        source: service._id,
                        service: service.service,
                        description: service.description,
                        cost: Math.ceil(labour_cost) + Math.ceil(service.part_cost),
                        labour_cost: Math.ceil(labour_cost),
                        part_cost: Math.ceil(service.part_cost),
                        type: "collision"
                    });
                    part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                    labourCost = Math.ceil(labourCost) + Math.ceil(labour_cost);
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Service Not Found",
                        responseData: {},
                    });
                }
            });

            await Washing.find({ service: req.body.label, model: checkCar.model }).cursor().eachAsync(async (service) => {
                if (service) {
                    var labour_cost = await q.all(packageDiscount(req.body.package, checkCar._id, "washing", service.service, Math.ceil(service.labour_cost)));


                    bookingService.push({
                        source: service._id,
                        service: service.service,
                        description: service.description,
                        cost: Math.ceil(labour_cost) + Math.ceil(service.part_cost),
                        labour_cost: Math.ceil(labour_cost),
                        part_cost: Math.ceil(service.part_cost),
                        type: "washing"
                    });
                    part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                    labourCost = Math.ceil(labourCost) + Math.ceil(labour_cost);
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Service Not Found",
                        responseData: {},
                    });
                }
            });

            var pick_up_charges = 0;
            if (req.body.convenience) {
                if (req.body.convenience != "Self Drop") {
                    var checkTotal = part_cost + labourCost;
                    if (checkTotal <= checkVendor.business_info.pick_up_limit) {
                        pick_up_charges = Math.ceil(checkVendor.business_info.pick_up_charges);
                    }
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
                terms: checkVendor.business_info.terms,
                pick_up_limit: checkVendor.business_info.pick_up_limit,
                pick_up_charges: pick_up_charges,
                part_cost: Math.ceil(part_cost),
                labour_cost: Math.ceil(labourCost),
                paid_total: Math.ceil(part_cost) + Math.ceil(labourCost),
                total: Math.ceil(part_cost) + Math.ceil(labourCost),
                discount_applied: false,
                transaction_id: "",
                transaction_date: "",
                transaction_status: "",
                transaction_response: ""
            }

            var data = {
                package: req.body.package,
                car: checkCar._id,
                business: checkPackage.business,
                user: user,
                services: bookingService,
                booking_no: Math.round(+new Date() / 1000) + Math.floor((Math.random() * 9999) + 1),
                date: req.body.date,
                time_slot: req.body.time_slot,
                convenience: req.body.convenience,
                status: "Inactive",
                payment: payment,
                address: req.body.address,
                is_services: true,
                created_at: new Date(),
                updated_at: new Date()
            };

            packageDiscountOn = [];

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
                                labour_cost: Math.ceil(booking.payment.labour_cost),
                                part_cost: Math.ceil(booking.payment.part_cost),
                                paid_total: Math.ceil(booking.payment.part_cost) + (Math.ceil(booking.payment.labour_cost) - Math.ceil(discount)),
                                total: Math.ceil(booking.payment.total),
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
            var business = await User.findById(booking.business).exec();
            var pick_up_limit = business.business_info.pick_up_limit;
            var pick_up_charges = business.business_info.pick_up_charges;

            if (booking.payment.paid_total != 0 && booking.package == null) {
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
                                                //toFixed
                                                discount = coupon.priceLimit;
                                                var paid_total = booking.payment.part_cost + (booking.payment.labour_cost - discount);

                                                var pick_up_charge = 0
                                                if (booking.convenience) {
                                                    if (booking.convenience != "Self Drop") {
                                                        if (paid_total <= pick_up_limit) {
                                                            paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                                            pick_up_charge = Math.ceil(pick_up_charges)
                                                        }
                                                    }
                                                }

                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        terms: booking.payment.terms,
                                                        pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                                        pick_up_charges: Math.ceil(pick_up_charge),
                                                        labour_cost: Math.ceil(booking.payment.labour_cost),
                                                        part_cost: Math.ceil(booking.payment.part_cost),
                                                        paid_total: Math.ceil(paid_total),
                                                        total: Math.ceil(booking.payment.total),
                                                        discount_applied: false,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }
                                            else {
                                                discount = checkDiscount;
                                                var paid_total = booking.payment.part_cost + (booking.payment.labour_cost - discount);

                                                var pick_up_charge = 0
                                                if (booking.convenience) {
                                                    if (booking.convenience != "Self Drop") {
                                                        if (paid_total <= pick_up_limit) {
                                                            paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                                            pick_up_charge = Math.ceil(pick_up_charges)
                                                        }
                                                    }
                                                }

                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        terms: booking.payment.terms,
                                                        pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                                        pick_up_charges: Math.ceil(pick_up_charge),
                                                        labour_cost: Math.ceil(booking.payment.labour_cost),
                                                        part_cost: Math.ceil(booking.payment.part_cost),
                                                        paid_total: Math.ceil(paid_total),
                                                        total: Math.ceil(booking.payment.total),
                                                        discount_applied: false,
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
                                            var paid_total = booking.payment.part_cost + (booking.payment.labour_cost - discount);
                                            var pick_up_charge = 0
                                            if (booking.convenience) {
                                                if (booking.convenience != "Self Drop") {
                                                    if (paid_total <= pick_up_limit) {
                                                        paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                                        pick_up_charge = Math.ceil(pick_up_charges)
                                                    }
                                                }
                                            }

                                            data = {
                                                payment: {
                                                    payment_mode: "Online",
                                                    discount_type: req.body.type,
                                                    coupon: req.body.coupon.toUpperCase(),
                                                    coupon_type: coupon.type,
                                                    discount: coupon.discount,
                                                    discount_total: discount,
                                                    terms: booking.payment.terms,
                                                    pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                                    pick_up_charges: Math.ceil(pick_up_charge),
                                                    labour_cost: Math.ceil(booking.payment.labour_cost),
                                                    part_cost: Math.ceil(booking.payment.part_cost),
                                                    paid_total: Math.ceil(paid_total),
                                                    total: Math.ceil(booking.payment.total),
                                                    discount_applied: false,
                                                    transaction_id: "",
                                                    transaction_date: "",
                                                    transaction_status: "",
                                                    transaction_response: ""
                                                }
                                            }
                                        }
                                        else if (coupon.type == "price") {
                                            discount = coupon.discount;
                                            var paid_total = booking.payment.part_cost + (booking.payment.labour_cost - discount);

                                            var pick_up_charge = 0
                                            if (booking.convenience) {
                                                if (booking.convenience != "Self Drop") {
                                                    if (paid_total <= pick_up_limit) {
                                                        paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                                        pick_up_charge = Math.ceil(pick_up_charges)
                                                    }
                                                }
                                            }

                                            data = {
                                                payment: {
                                                    payment_mode: "Online",
                                                    discount_type: req.body.type,
                                                    coupon: req.body.coupon.toUpperCase(),
                                                    coupon_type: coupon.type,
                                                    discount: coupon.discount,
                                                    discount_total: discount,
                                                    terms: booking.payment.terms,
                                                    pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                                    pick_up_charges: Math.ceil(pick_up_charge),
                                                    labour_cost: Math.ceil(booking.payment.labour_cost),
                                                    part_cost: Math.ceil(booking.payment.part_cost),
                                                    paid_total: Math.ceil(paid_total),
                                                    total: Math.ceil(booking.payment.total),
                                                    discount_applied: false,
                                                    transaction_id: "",
                                                    transaction_date: "",
                                                    transaction_status: "",
                                                    transaction_response: ""
                                                }
                                            }
                                        }

                                        if (data.payment.paid_total >= 0) {
                                            Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
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
                                            //var other =  _.filter(booking.services, type => type.type != coupon.for);
                                            var coupon_labour_cost = _.sumBy(coupon_for, x => x.labour_cost);
                                            var labour_cost = _.sumBy(booking.services, x => x.labour_cost) - coupon_labour_cost;

                                            // console.log("labour_cost: " + labour_cost)
                                            var part_cost = _.sumBy(booking.services, x => x.part_cost);

                                            if (coupon.type == "percent") {
                                                discount = coupon_labour_cost * (coupon.discount / 100);
                                                var paid_total = part_cost + labour_cost + coupon_labour_cost - discount;

                                                var pick_up_charge = 0
                                                if (booking.convenience) {
                                                    if (booking.convenience != "Self Drop") {
                                                        if (paid_total <= pick_up_limit) {
                                                            paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                                            pick_up_charge = Math.ceil(pick_up_charges)
                                                        }
                                                    }
                                                }

                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        terms: booking.payment.terms,
                                                        pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                                        pick_up_charges: Math.ceil(pick_up_charge),
                                                        labour_cost: Math.ceil(booking.payment.labour_cost),
                                                        part_cost: Math.ceil(booking.payment.part_cost),
                                                        paid_total: Math.ceil(paid_total),
                                                        total: Math.ceil(booking.payment.total),
                                                        discount_applied: false,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }
                                            else if (coupon.type == "price") {
                                                discount = coupon.discount;
                                                var paid_total = part_cost + labour_cost + (coupon_labour_cost - discount);

                                                var pick_up_charge = 0
                                                if (booking.convenience) {
                                                    if (booking.convenience != "Self Drop") {
                                                        if (paid_total <= pick_up_limit) {
                                                            paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                                            pick_up_charge = Math.ceil(pick_up_charges)
                                                        }
                                                    }
                                                }

                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        terms: booking.payment.terms,
                                                        pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                                        pick_up_charges: Math.ceil(pick_up_charge),
                                                        labour_cost: Math.ceil(booking.payment.labour_cost),
                                                        part_cost: Math.ceil(booking.payment.part_cost),
                                                        paid_total: Math.ceil(paid_total),
                                                        total: Math.ceil(booking.payment.total),
                                                        discount_applied: false,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }

                                            if (data.payment.paid_total >= 0) {
                                                Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
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
                                            //var other =  _.filter(booking.services, service => service.service != coupon.for);
                                            var coupon_labour_cost = _.sumBy(coupon_for, x => x.labour_cost);
                                            // console.log("coupon_labour_cost: " + coupon_labour_cost)
                                            var labour_cost = _.sumBy(booking.services, x => x.labour_cost) - coupon_labour_cost;
                                            // console.log("labour_cost: " + labour_cost)
                                            var part_cost = _.sumBy(booking.services, x => x.part_cost);

                                            if (coupon.type == "percent") {
                                                discount = coupon_labour_cost * (coupon.discount / 100);
                                                var paid_total = part_cost + labour_cost + coupon_labour_cost - discount;

                                                var pick_up_charge = 0
                                                if (booking.convenience) {
                                                    if (booking.convenience != "Self Drop") {
                                                        if (paid_total <= pick_up_limit) {
                                                            paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                                            pick_up_charge = Math.ceil(pick_up_charges)
                                                        }
                                                    }
                                                }
                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        terms: booking.payment.terms,
                                                        pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                                        pick_up_charges: Math.ceil(pick_up_charge),
                                                        labour_cost: Math.ceil(booking.payment.labour_cost),
                                                        part_cost: Math.ceil(booking.payment.part_cost),
                                                        paid_total: Math.ceil(paid_total),
                                                        total: Math.ceil(booking.payment.total),
                                                        discount_applied: false,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }
                                            if (coupon.type == "fixed") {
                                                discount = coupon.discount;
                                                var paid_total = part_cost + labour_cost + discount;

                                                var pick_up_charge = 0
                                                if (booking.convenience) {
                                                    if (booking.convenience != "Self Drop") {
                                                        if (paid_total <= pick_up_limit) {
                                                            paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                                            pick_up_charge = Math.ceil(pick_up_charges)
                                                        }
                                                    }
                                                }

                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        terms: booking.payment.terms,
                                                        pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                                        pick_up_charges: Math.ceil(pick_up_charge),
                                                        discount_total: Math.ceil(coupon_labour_cost) - Math.ceil(coupon.discount),
                                                        labour_cost: Math.ceil(booking.payment.labour_cost),
                                                        part_cost: Math.ceil(booking.payment.part_cost),
                                                        paid_total: Math.ceil(paid_total),
                                                        total: Math.ceil(booking.payment.total),
                                                        discount_applied: false,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }
                                            else if (coupon.type == "price") {
                                                discount = coupon.discount;
                                                var paid_total = part_cost + labour_cost + (coupon_labour_cost - discount);

                                                var pick_up_charge = 0
                                                if (booking.convenience) {
                                                    if (booking.convenience != "Self Drop") {
                                                        if (paid_total <= pick_up_limit) {
                                                            paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                                            pick_up_charge = Math.ceil(pick_up_charges)
                                                        }
                                                    }
                                                }
                                                data = {
                                                    payment: {
                                                        payment_mode: "Online",
                                                        discount_type: req.body.type,
                                                        coupon: req.body.coupon.toUpperCase(),
                                                        coupon_type: coupon.type,
                                                        discount: coupon.discount,
                                                        discount_total: discount,
                                                        terms: booking.payment.terms,
                                                        pick_up_charges: Math.ceil(booking.payment.pick_up_limit),
                                                        pick_up_charges: Math.ceil(pick_up_charge),
                                                        labour_cost: Math.ceil(booking.payment.labour_cost),
                                                        part_cost: Math.ceil(booking.payment.part_cost),
                                                        paid_total: Math.ceil(paid_total),
                                                        total: Math.ceil(booking.payment.total),
                                                        discount_applied: false,
                                                        transaction_id: "",
                                                        transaction_date: "",
                                                        transaction_status: "",
                                                        transaction_response: ""
                                                    }
                                                }
                                            }

                                            if (data.payment.paid_total >= 0) {
                                                Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
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
                        if (getCoins.careager_cash > 0) {
                            var coinsCalc = getCoins.careager_cash * 70;
                            if (coinsCalc < booking.payment.total) {
                                discount = getCoins.careager_cash;
                                var paid_total = booking.payment.part_cost + (booking.payment.labour_cost - discount);

                                var pick_up_charge = 0
                                if (booking.convenience) {
                                    if (booking.convenience != "Self Drop") {
                                        if (paid_total <= pick_up_limit) {
                                            paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                            pick_up_charge = Math.ceil(pick_up_charges)
                                        }
                                    }
                                }

                                // console.log(pick_up_charges + "coin 1")
                                data = {
                                    payment: {
                                        payment_mode: "Online",
                                        discount_type: req.body.type,
                                        coupon: "",
                                        coupon_type: "price",
                                        discount: discount,
                                        discount_total: discount,
                                        terms: booking.payment.terms,
                                        pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                        pick_up_charges: Math.ceil(pick_up_charge),
                                        labour_cost: Math.ceil(booking.payment.labour_cost),
                                        part_cost: Math.ceil(booking.payment.part_cost),
                                        paid_total: Math.ceil(paid_total),
                                        total: Math.ceil(booking.payment.total),
                                        discount_applied: false,
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

                                var pick_up_charge = 0
                                if (booking.convenience) {
                                    if (booking.convenience != "Self Drop") {
                                        if (paid_total <= pick_up_limit) {
                                            paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                            pick_up_charge = Math.ceil(pick_up_charges)
                                        }
                                    }
                                }
                                // console.log(pick_up_charges + "coin 2")

                                if (paid_total >= 0) {
                                    data = {
                                        payment: {
                                            payment_mode: "Online",
                                            discount_type: req.body.type,
                                            coupon: "",
                                            coupon_type: "price",
                                            discount: discount,
                                            discount_total: discount,
                                            terms: booking.payment.terms,
                                            pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                            pick_up_charges: Math.ceil(pick_up_charge),
                                            labour_cost: Math.ceil(booking.payment.labour_cost),
                                            part_cost: Math.ceil(booking.payment.part_cost),
                                            paid_total: Math.ceil(paid_total),
                                            total: Math.ceil(booking.payment.total),
                                            discount_applied: false,
                                            transaction_id: "",
                                            transaction_date: "",
                                            transaction_status: "",
                                            transaction_response: ""
                                        }
                                    }
                                }
                                else {
                                    var paid_total = booking.payment.part_cost;

                                    var pick_up_charge = 0
                                    if (booking.convenience) {
                                        if (booking.convenience != "Self Drop") {
                                            if (paid_total <= pick_up_limit) {
                                                paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                                pick_up_charge = Math.ceil(pick_up_charges)
                                            }
                                        }
                                    }

                                    // console.log(pick_up_charges + "coin 3")

                                    data = {
                                        payment: {
                                            payment_mode: "Online",
                                            discount_type: req.body.type,
                                            coupon: "",
                                            coupon_type: "price",
                                            terms: booking.payment.terms,
                                            discount: booking.payment.labour_cost,
                                            discount_total: booking.payment.labour_cost,
                                            pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                            pick_up_charges: Math.ceil(pick_up_charge),
                                            labour_cost: Math.ceil(booking.payment.labour_cost),
                                            part_cost: Math.ceil(booking.payment.part_cost),
                                            paid_total: Math.ceil(paid_total),
                                            total: Math.ceil(booking.payment.total),
                                            discount_applied: false,
                                            transaction_id: "",
                                            transaction_date: "",
                                            transaction_status: "",
                                            transaction_response: ""
                                        }
                                    }
                                }
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
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "CarEager Coin Applied",
                                        responseData: data.payment
                                    })
                                }
                            });

                        }
                        else {
                            var paid_total = booking.payment.part_cost + booking.payment.labour_cost;
                            var pick_up_charge = 0
                            if (booking.convenience) {
                                if (booking.convenience != "Self Drop") {
                                    if (paid_total <= pick_up_limit) {
                                        paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                        pick_up_charge = Math.ceil(pick_up_charges)
                                    }
                                }
                            }

                            // console.log(pick_up_charges + "coin 4")

                            data = {
                                payment: {
                                    payment_mode: "Online",
                                    discount_type: "coins",
                                    coupon: '',
                                    coupon_type: '',
                                    discount: 0,
                                    discount_total: 0,
                                    terms: booking.payment.terms,
                                    pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                    pick_up_charges: Math.ceil(pick_up_charge),
                                    labour_cost: Math.ceil(booking.payment.labour_cost),
                                    part_cost: Math.ceil(booking.payment.part_cost),
                                    paid_total: Math.ceil(paid_total),
                                    total: Math.ceil(booking.payment.total),
                                    discount_applied: false,
                                    transaction_id: "",
                                    transaction_date: "",
                                    transaction_status: "",
                                    transaction_response: ""
                                }
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
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "CarEager Coin Applied",
                                        responseData: data.payment
                                    })
                                }
                            });
                        }
                    }
                    else {
                        var paid_total = booking.payment.part_cost + booking.payment.labour_cost;

                        var pick_up_charge = 0
                        if (booking.convenience) {
                            if (booking.convenience != "Self Drop") {
                                if (paid_total <= pick_up_limit) {
                                    paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                    pick_up_charge = Math.ceil(pick_up_charges)
                                }
                            }
                        }
                        // console.log(pick_up_charges + "coin 5")
                        data = {
                            payment: {
                                payment_mode: "Online",
                                discount_type: "coins",
                                coupon: '',
                                coupon_type: '',
                                discount: 0,
                                discount_total: 0,
                                terms: booking.payment.terms,
                                pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                                pick_up_charges: Math.ceil(pick_up_charge),
                                labour_cost: Math.ceil(booking.payment.labour_cost),
                                part_cost: Math.ceil(booking.payment.part_cost),
                                paid_total: Math.ceil(paid_total),
                                total: Math.ceil(booking.payment.total),
                                discount_applied: false,
                                transaction_id: "",
                                transaction_date: "",
                                transaction_status: "",
                                transaction_response: ""
                            }
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
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "CarEager Coin Applied",
                                    responseData: data.payment
                                })
                            }
                        });
                    }
                }
            }
            else {
                if (req.body.type == "coins") {
                    var paid_total = booking.payment.part_cost + booking.payment.labour_cost;

                    var pick_up_charge = 0
                    if (booking.convenience) {
                        if (booking.convenience != "Self Drop") {
                            if (paid_total <= pick_up_limit) {
                                paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                pick_up_charge = Math.ceil(pick_up_charges)
                            }
                        }
                    }
                    // console.log(pick_up_charges + "coin 6")

                    data = {
                        payment: {
                            payment_mode: "Online",
                            discount_type: "coins",
                            coupon: '',
                            coupon_type: '',
                            discount: 0,
                            discount_total: 0,
                            terms: booking.payment.terms,
                            pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                            pick_up_charges: Math.ceil(pick_up_charge),
                            labour_cost: Math.ceil(booking.payment.labour_cost),
                            part_cost: Math.ceil(booking.payment.part_cost),
                            paid_total: Math.ceil(paid_total),
                            total: Math.ceil(booking.payment.total),
                            discount_applied: false,
                            transaction_id: "",
                            transaction_date: "",
                            transaction_status: "",
                            transaction_response: ""
                        }
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
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "CarEager Coin Applied",
                                responseData: data.payment
                            })
                        }
                    });
                }
                else {
                    var paid_total = booking.payment.part_cost + booking.payment.labour_cost;

                    var pick_up_charge = 0
                    if (booking.convenience) {
                        if (booking.convenience != "Self Drop") {
                            if (paid_total <= pick_up_limit) {
                                paid_total = Math.ceil(paid_total) + Math.ceil(pick_up_charges);
                                pick_up_charge = Math.ceil(pick_up_charges)
                            }
                        }
                    }

                    // console.log(pick_up_charges + "coin 7")

                    data = {
                        payment: {
                            payment_mode: "Online",
                            discount_type: "coupon",
                            coupon: '',
                            coupon_type: '',
                            discount: 0,
                            discount_total: 0,
                            terms: booking.payment.terms,
                            pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                            pick_up_charges: Math.ceil(pick_up_charge),
                            labour_cost: Math.ceil(booking.payment.labour_cost),
                            part_cost: Math.ceil(booking.payment.part_cost),
                            paid_total: Math.ceil(paid_total),
                            total: Math.ceil(booking.payment.total),
                            discount_applied: false,
                            transaction_id: "",
                            transaction_date: "",
                            transaction_status: "",
                            transaction_response: ""
                        }
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
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "CarEager Coin Applied",
                                responseData: data.payment
                            })
                        }
                    });
                }

                /*res.status(422).json({
                   responseCode: 422,
                   responseMessage: "Invalid Coupon Code",
                   responseData: {}
               });*/
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

                Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
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

                    var paramarray = {
                        ORDER_ID: aes256.encrypt(key, booking.order_id.toString()),
                        CUST_ID: aes256.encrypt(key, user.toString()),
                        ACCESS_CODE: "AVYT82GA63AD63TYDA",
                        MERCHANT_ID: "203679",
                        CURRENCY: aes256.encrypt(key, "INR"),
                        TXN_AMOUNT: aes256.encrypt(key, total.toString()),
                        EMAIL: aes256.encrypt(key, getUser.email),
                        MOBILE_NO: aes256.encrypt(key, getUser.contact_no),
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
                    res.status(401).json({
                        responseCode: 401,
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

/**
 * [Payment Gateway Request API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

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
                due: null,
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


function addZeroes(num) {
    var num = Number(num);
    if (String(num).split(".").length < 2 || String(num).split(".")[1].length <= 2) {
        num = num.toFixed(2);
    }
    return num;
}

/**
 * [Checksum Generate API]
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
                            total = Math.ceil(total)
                        }
                        else {
                            var total = booking.due.due;
                            total = Math.ceil(total)
                        }
                    }
                    else {
                        var total = booking.payment.paid_total;
                        total = Math.ceil(total)
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
                    res.status(401).json({
                        responseCode: 401,
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



/**
 * [PayTm Status API]
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
    var booking = await Booking.findOne({ order_id: req.query.id }).exec();
    var getUser = await User.findById(user).exec();
    if (booking) {
        if (booking.user == user) {
            if (booking.due != null) {
                if (booking.due.pay) {
                    var paid_total = Math.ceil(booking.payment.paid_total) + Math.ceil(booking.due.pay);
                } else {
                    var paid_total = Math.ceil(booking.payment.paid_total) + Math.ceil(booking.due.due);
                }
            }
            else {
                var paid_total = Math.ceil(booking.payment.paid_total);
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
                            /*var d1 = booking.date;
                            var date = new Date();
                            var d2 = new Date(date.getFullYear(), date.getMonth(),  date.getDate());
                            var seconds = (d1.getTime() - d2.getTime()) / 1000;

                            if(seconds>=172800)
                            {
                                var status= "Confirmed"
                            }
                            else{
                                var status= "Pending"
                            }*/



                            if (booking.due) {
                                if (booking.due.pay) {
                                    var due = booking.due.due - parseFloat(paytmRes.TXNAMOUNT);
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
                                status: "Pending",
                                payment: {
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
                                    labour_cost: Math.ceil(booking.payment.labour_cost),
                                    part_cost: Math.ceil(booking.payment.part_cost),
                                    paid_total: Math.ceil(paid_total),
                                    total: Math.ceil(booking.payment.total),
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
                                                var checkUsedPackage = PackageUsed.find({ package: p.package, booking: p.booking, label: p.label, }).count().exec();

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
                                            //event.bookingMailAdvisor(booking._id);   
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
                            if (booking.due) {
                                var data = {
                                    status: "Failure",
                                    payment: {
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
                                        labour_cost: Math.ceil(booking.payment.labour_cost),
                                        part_cost: Math.ceil(booking.payment.part_cost),
                                        paid_total: Math.ceil(booking.payment.paid_total),
                                        total: Math.ceil(booking.payment.total),
                                        discount_applied: booking.payment.discount_applied,
                                        transaction_id: paytmRes.TXNID,
                                        transaction_date: paytmRes.TXNDATE,
                                        transaction_status: paytmRes.STATUS,
                                        transaction_response: paytmRes.RESPMSG,
                                        transaction_response: paytmRes.TXNAMOUNT
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
                                        terms: booking.payment.terms,
                                        discount_total: booking.payment.discount_total,
                                        pick_up_limit: booking.payment.pick_up_limit,
                                        pick_up_charges: booking.payment.pick_up_charges,
                                        labour_cost: Math.ceil(booking.payment.labour_cost),
                                        part_cost: Math.ceil(booking.payment.part_cost),
                                        paid_total: Math.ceil(booking.payment.paid_total),
                                        total: Math.ceil(booking.payment.total),
                                        discount_applied: booking.payment.discount_applied,
                                        transaction_id: paytmRes.TXNID,
                                        transaction_date: paytmRes.TXNDATE,
                                        transaction_status: paytmRes.STATUS,
                                        transaction_response: paytmRes.RESPMSG,
                                        transaction_response: paytmRes.TXNAMOUNT
                                    },
                                    due: {
                                        due: booking.payment.paid_total
                                    }
                                }
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
 * [Payment Gateway Response API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

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

/**
 * [Payu Gateway Success API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

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
                due: null,
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

/**
 * [Payu Gateway Failure API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

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
        var cpu = 0;
        if (booking) {

            if (booking.due != null) {
                var paid_total = booking.payment.paid_total + booking.due.due;

            }
            else {
                var paid_total = booking.payment.paid_total;
            }


            /*var d1 = booking.date;

            var date = new Date();
            var d2 = new Date(date.getFullYear(), date.getMonth(),  date.getDate());
            var seconds = (d1.getTime() - d2.getTime()) / 1000;
            // console.log(seconds)
            if(seconds>=172800)
            {
                var status= "Confirmed"
            }
            else{
                var status= "Pending"
            }*/

            var data = {
                status: "Pending",
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

/**
 * [Pay Later API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

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
        var booking = await Booking.findById(req.body.id).exec();
        var coupon = await Coupon.findOne({ code: req.body.coupon }).exec();

        if (booking) {
            var package = _.filter(booking.services, type => type.type == "package");
            // console.log(Object.keys(package).length)
            if (Object.keys(package).length <= 0) {
                /*var d1 = booking.date;
                var date = new Date();
                var d2 = new Date(date.getFullYear(), date.getMonth(),  date.getDate());
                var seconds = (d1.getTime() - d2.getTime()) / 1000;
                // console.log(seconds)
                if(seconds>=172800)
                {
                    var status= "Confirmed"
                }
                else{
                    var status= "Pending"
                }*/

                if (booking.payment.discount_total) {
                    var due = booking.payment.total - booking.payment.discount_total + booking.payment.pick_up_charges;
                }
                else {
                    var due = booking.payment.total + booking.payment.pick_up_charges
                }

                var data = {
                    status: "Pending",
                    payment: {
                        payment_mode: booking.payment.payment_mode,
                        payment_status: "Pending",
                        discount_type: booking.payment.discount_type,
                        coupon: booking.payment.coupon,
                        coupon_type: booking.payment.coupon_type,
                        discount: booking.payment.discount,
                        discount_total: booking.payment.discount_total,
                        terms: booking.payment.terms,
                        pick_up_charges: booking.payment.pick_up_charges,
                        pick_up_limit: booking.payment.pick_up_limit,
                        labour_cost: Math.ceil(booking.payment.labour_cost),
                        part_cost: Math.ceil(booking.payment.part_cost),
                        paid_total: 0,
                        total: Math.ceil(booking.payment.total),
                        discount_applied: booking.payment.discount_applied,
                        transaction_id: "",
                        transaction_date: "",
                        transaction_status: "",
                        transaction_response: "",
                        transaction_response: ""
                    },
                    due: {
                        due: due
                    }
                }

                // console.log(data)
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
        responseMessage: "Payment Failure",
        responseData: {}
    });
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
                var booking = null
                var check = await Review.find({ user: user, business: req.body.business, type: "profile" }).count().exec();
                if (check > 0) {
                    await Review.remove({ user: user, business: req.body.business, type: "profile" }).exec();
                }
            }
            else {
                var booking = req.body.booking;

            }


            req.body.booking = booking;
            req.body.user = user;
            req.body.created_at = new Date();
            req.body.updated_at = new Date();

            await Review.create(req.body).then(async function (data) {

                if (data.type == "service") {
                    var booking_details = await Booking.findOne({ _id: req.body.booking }).exec();
                    if (data.rating <= 3) {
                        event.zohoCustomStatus(data.booking, "Dissatisfied");
                    }

                    Review.findOneAndUpdate({ booking: booking }, { $set: { status: false } }, { new: true }, async function (err, doc) { });
                    Booking.findOneAndUpdate({ _id: booking }, { $set: { is_reviewed: true } }, { new: true }, async function (err, doc) { });

                    if (booking_details.advisor) {
                        var notify = {
                            receiver: [booking_details.advisor],
                            sender: data.user,
                            activity: "profile",
                            tag: "review",
                            points: data.rating,
                        }

                        fun.newNotification(notify);
                    }

                    if (booking_details.manager) {
                        var notify = {
                            receiver: [booking_details.manager],
                            sender: data.user,
                            activity: "profile",
                            tag: "review",
                            points: data.rating,
                        }

                        fun.newNotification(notify);
                    }

                }


                var point = {
                    user: user,
                    activity: "coin",
                    tag: "businessReview",
                    points: 10,
                    status: true
                }
                fun.addPoints(point);


                var notify = {
                    receiver: [data.business],
                    sender: data.user,
                    activity: "profile",
                    tag: "review",
                    points: data.rating,
                }

                fun.newNotification(notify);

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
                    activity: "coin",
                    tag: "modelReview",
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
        var checkLead = await Lead.findOne({ user: decoded.user, type: "Claim Intimation", "remark.status": "Open" }).sort({ created_at: -1 }).exec();
        if (checkLead) {
            Lead.findOneAndUpdate({ _id: checkLead._id }, { $set: { updated_at: new Date() } }, { new: true }, async function (err, doc) {
                var status = await LeadStatus.findOne({ status: "Open" }).exec();
                LeadRemark.create({
                    lead: checkLead._id,
                    status: status.status,
                    customer_remark: "",
                    assignee_remark: "",
                    assignee: checkLead.assignee,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                event.assistance(checkLead, req.headers['tz'])
                //event.zohoLead(checkLead,manager)

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
            var details = await User.findById(decoded.user).exec();

            var status = await LeadStatus.findOne({ status: "Open" }).exec();

            var managers = [];
            await LeadManagement.find({ business: "5bfec47ef651033d1c99fbca", source: "Claim Intimation" })
                .cursor().eachAsync(async (a) => {
                    var d = await Lead.find({ business: "5bfec47ef651033d1c99fbca", assignee: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();
                    managers.push({
                        user: a.user,
                        count: d
                    })
                });

            // console.log(managers)

            if (managers.length != 0) {
                managers.sort(function (a, b) {
                    return a.count > b.count;
                });

                manager = managers[0].user;
            }

            data.user = decoded.user;
            data.business = "5bfec47ef651033d1c99fbca";
            data.name = details.name;
            data.contact_no = details.contact_no;
            data.email = details.email;
            data.assignee = manager;
            data.type = "Claim Intimation";
            data.geometry = [req.body.longitude, req.body.latitude],
                data.source = req.headers['devicetype'];
            data.remark = {
                status: status.status,
                customer_remark: "",
                assignee_remark: "",
                assignee: manager,
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            };
            data.created_at = new Date();
            data.updated_at = new Date();

            Lead.create(data).then(async function (lead) {
                var status = await LeadStatus.findOne({ status: "Open" }).exec();
                LeadRemark.create({
                    lead: lead._id,
                    status: status.status,
                    customer_remark: "",
                    assignee_remark: "",
                    assignee: manager,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                event.assistance(lead, req.headers['tz'])
                //event.zohoLead(lead,manager)

                var json = ({
                    responseCode: 200,
                    responseMessage: "Location details are shared with our Roadside Assistance Team. You'll be contacted as soon as possible. Alternatively, you can also call us at 1800 843 4300",
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


router.post('/callback/request', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    const count = await User.count({ _id: decoded.user }).exec();

    if (count == 1) {
        var checkLead = await Lead.findOne({ user: decoded.user, type: "Callback Request", "remark.status": "Open" }).sort({ created_at: -1 }).exec();
        if (checkLead) {
            Lead.findOneAndUpdate({ _id: checkLead._id }, { $set: { updated_at: new Date() } }, { new: true }, async function (err, doc) {
                var status = await LeadStatus.findOne({ status: "Open" }).exec();
                LeadRemark.create({
                    lead: checkLead._id,
                    status: status.status,
                    customer_remark: "",
                    assignee_remark: "",
                    assignee: checkLead.manager,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                event.callbackRequest(checkLead, req.headers['tz'])
                //event.zohoLead(checkLead,manager)

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
            var details = await User.findById(decoded.user).exec();

            var status = await LeadStatus.findOne({ status: "Open" }).exec();

            var managers = [];
            await Management.find({ business: "5bfec47ef651033d1c99fbca", role: "CRE" })
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

            data.user = decoded.user;
            data.business = "5bfec47ef651033d1c99fbca";
            data.name = details.name;
            data.contact_no = details.contact_no;
            data.email = details.email;
            data.assignee = manager;
            data.type = "Callback Request";
            data.geometry = [req.body.longitude, req.body.latitude],
                data.source = req.headers['devicetype'];
            data.remark = {
                status: status.status,
                customer_remark: "",
                assignee_remark: "",
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            };
            data.created_at = new Date();
            data.updated_at = new Date();

            Lead.create(data).then(async function (lead) {
                var status = await LeadStatus.findOne({ status: "Open" }).exec();
                LeadRemark.create({
                    lead: lead._id,
                    status: status.status,
                    customer_remark: "",
                    assignee_remark: "",
                    assignee: manager,
                    color_code: status.color_code,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                event.callbackRequest(lead, req.headers['tz'])
                //event.zohoLead(lead,manager)

                var json = ({
                    responseCode: 200,
                    responseMessage: "Location details are shared with our Roadside Assistance Team. You'll be contacted as soon as possible. Alternatively, you can also call us at 1800 843 4300",
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

router.get('/car/search', xAccessToken.token, async function (req, res, next) {
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
                    insurance: car.insurance,
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
                    insurance: car.insurance,
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

/**
 * [Purchased Packages API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

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
                        if (!packageDiscountOn.includes(s)) {
                            labour_cost = lc - lc * (dis.discount / 100);
                        }
                        // console.log(s + " - " + cat + " - " + dis.discount)
                    }
                }
                else if (dis.for == "specific") {
                    if (dis.label == s) {
                        if (dis.limit > packageUsed) {
                            packageDiscountOn.push(s)
                            labour_cost = lc - lc * (dis.discount / 100);
                        }
                        // console.log(s + " - " + cat + " - " + dis.discount)
                    }
                }
            });

        }
    }
    // console.log(packageDiscountOn)
    return labour_cost;
}

async function packageDiscountRegister(p, car, cat, s, b, tz) {
    var package = await UserPackage.findOne({ _id: p, car: car }).exec();

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
                        if (!packageDiscountOn.includes(cat)) {
                            packageDiscountOn.push(cat)
                            var checkPoint = await PackageUsed.find({ package: p, booking: b }).count().exec();
                            if (checkPoint == 0) {
                                PackageUsed.create({
                                    package: p,
                                    car: car,
                                    user: package.user,
                                    booking: b,
                                    for: cat,
                                    label: s,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                })
                            }
                        }
                        // console.log(packageDiscountOn)
                    }
                }
                else if (dis.for == "specific") {
                    if (dis.label == s) {
                        if (dis.limit > packageUsed) {
                            packageDiscountOn.push(cat)
                            PackageUsed.create({
                                package: p,
                                car: car,
                                user: package.user,
                                booking: b,
                                for: s,
                                label: s,
                                created_at: new Date(),
                                updated_at: new Date()
                            })
                        }
                        // console.log(packageDiscountOn)
                    }
                }

            });

        }
    }
    return b;
    // console.log(packageDiscountOn)
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
module.exports = router
