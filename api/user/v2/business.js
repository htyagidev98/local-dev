var mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router(),
    config = require('./../../config')
bcrypt = require('bcrypt-nodejs')
assert = require('assert')
jwt = require('jsonwebtoken')
aws = require('aws-sdk')
multerS3 = require('multer-s3')
uuidv1 = require('uuid/v1')
Validator = require('validatorjs')
multer = require('multer')
moment = require('moment-timezone'),
    request = require('request');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});


const xAccessToken = require('../../middlewares/xAccessToken');
const event = require('../../api/v2/event');

var salt = bcrypt.genSaltSync(10);
const User = require('../../models/user');
const BusinessTiming = require('../../models/businessTiming');
const Type = require('../../models/type');
const BusinessType = require('../../models/businessType');
const Category = require('../../models/category');
const Automaker = require('../../models/automaker');
const Model = require('../../models/model');
const State = require('../../models/state');
const ProductCategory = require('../../models/productCategory');
const BusinessProduct = require('../../models/businessProduct');
const ProductImage = require('../../models/productImage');
const Country = require('../../models/country');
const BusinessOffer = require('../../models/businessOffer');
const BusinessServicePackage = require('../../models/businessServicePackage');
const BookmarkProduct = require('../../models/bookmarkProduct');
const BookmarkOffer = require('../../models/bookmarkOffer');
const Car = require('../../models/car');
const CarImage = require('../../models/carImage');
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
const Battery = require('../../models/battery');
const BatteryBrand = require('../../models/batteryBrand');
const TyreBrand = require('../../models/tyreBrand');
const TyreSize = require('../../models/tyreSize');

var secret = config.secret;

/**
    * [signup API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/signup', async function (req, res, next) {
    var rules = {
        contact_no: 'required',
        username: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Mobile No. and Username is required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        if (req.body.email) {
            var checkEmail = await User.find({ email: req.body.email }).count().exec();
        }
        else {
            var checkEmail = 0;
        }


        if (checkEmail) {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Email already in use.",
                responseData: {},
            });
        }
        else {
            var checkUsername = await User.find({ username: req.body.username }).collation({ locale: 'en', strength: 2 }).exec();
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
                        //res.json(req.body)
                        var otp = Math.floor(Math.random() * 90000) + 10000;

                        req.body.socialite = "";
                        req.body.optional_info = "";

                        var country = await Country.findOne({ _id: req.body.country }).exec();
                        req.body.address = {
                            country: country.countryName,
                            timezone: req.headers['tz'],
                            location: req.body.location,
                        };

                        req.body.account_info = {
                            type: "business",
                            status: "Complete",
                            phone_verified: false,
                            verified_account: false,
                            approved_by_admin: false,
                        };

                        req.body.geometry = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];

                        req.body.device = [];
                        req.body.otp = otp;

                        req.body.business_info = {
                            business_category: req.body.business_category,
                            company: req.body.company
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

                            Type.find({}).then(function (BT) {
                                BT.forEach(function (u) {
                                    var businessType = new BusinessType({
                                        business: user._id,
                                        business_type: u._id,
                                        is_added: false,
                                    });
                                    businessType.save();
                                });
                            });

                            event.otpSms(user);
                            // event.registrationSms(user);

                            return res.status(200).json({
                                responseCode: 200,
                                responseMessage: "success",
                                responseData: {
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
    }
});


//-----------------------START OF PRODUCT API----------------------------

/**
    * [List product categories]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/product/category', xAccessToken.token, async function (req, res, next) {
    var userId = req.query.id;
    const productCategories = await ProductCategory.find({ parent_id: null }).exec();
    return res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: productCategories
    });
});

/**
    * [List product subcategories]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/product/subcategories', xAccessToken.token, async function (req, res, next) {
    var id = req.query.id;
    const productCategories = await ProductCategory.find({ parent_id: id }).exec();

    return res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: productCategories,
    });
});

/**
    * [List Tyre Size]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/tyreSize/get', xAccessToken.token, async function (req, res, next) {
    var query = req.query.query;
    var tyre = await TyreSize.find({ value: { $regex: new RegExp(query, 'i') } }).exec();

    return res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: tyre
    });
});

/**
 * [Add Product API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/product/add', xAccessToken.token, async function (req, res, next) {

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = decoded.user;
    var product = new Object();
    var result = [];

    var productCount = await BusinessProduct.find({}).count().exec();

    var currentDate = new Date();

    req.body.created_at = currentDate;
    req.body.updated_at = currentDate;
    req.body.product_id = productCount + 1000000;
    req.body.business = business;

    BusinessProduct.create(req.body).then(async function (pro) {
        await BusinessProduct.findOne({ _id: pro._id })
            .populate('bookmark')
            .populate('thumbnails')
            .populate({ path: 'business', select: 'name username avatar avatar_address address' })
            .populate({ path: 'category' }).cursor().eachAsync(async (p) => {
                result = {
                    _id: p._id,
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    model_no: p.model_no,
                    price: p.price,
                    discount: p.discount,
                    detail: p.detail,
                    category: p.category,
                    thumbnails: p.thumbnails,
                    business: p.business,
                    bookmark: p.bookmark,
                    created_at: moment(p.created_at).tz(req.headers['tz']).format('LL'),
                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('LL'),
                }
            });
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Product has been added",
            responseData: {
                item: result
            }
        });

    }).catch(next);
});

/**
    * [Edit Product]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.put('/product/edit', xAccessToken.token, async function (req, res, next) {
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
        var check = await BusinessProduct.find({ _id: req.body.id, business: business }).count().exec();
        if (check == 1) {
            var token = req.headers['x-access-token'];
            var secret = config.secret;
            var decoded = jwt.verify(token, secret);
            var business = decoded.user;
            var product = [];

            var data = {
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                discount: req.body.discount,
                model_no: req.body.model_no,
                detail: req.body.detail,
                updated_at: new Date()
            };

            BusinessProduct.findOneAndUpdate({ _id: req.body.id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });

                    res.status(400).json(json)
                }
                else {
                    await BusinessProduct.findOne({ _id: req.body.id, business: business })
                        .populate('bookmark')
                        .populate('thumbnails')
                        .populate({ path: 'business', select: 'name username avatar avatar_address address' })
                        .populate({ path: 'category' })
                        .cursor().eachAsync(async (p) => {
                            return res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Product has been edited",
                                responseData: {
                                    item: {
                                        _id: p._id,
                                        id: p.id,
                                        title: p.title,
                                        description: p.description,
                                        price: p.price,
                                        discount: p.discount,
                                        category: p.category,
                                        model_no: p.model_no,
                                        thumbnails: p.thumbnails,
                                        business: p.business,
                                        bookmark: p.bookmark,
                                        created_at: moment(p.created_at).tz(req.headers['tz']).format('LL'),
                                        updated_at: moment(p.updated_at).tz(req.headers['tz']).format('LL'),
                                    }
                                }
                            });
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

/**
    * [Publish product]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.put('/product/publish', xAccessToken.token, async function (req, res, next) {
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

        var product = await BusinessProduct.findOne({ _id: req.body.id, business: business }).exec();
        if (product) {
            if (product.publish == false) {
                var data = {
                    publish: true,
                    updated_at: new Date()
                };
            } else {
                var data = {
                    publish: false,
                    updated_at: new Date()
                };
            }

            await BusinessProduct.findOneAndUpdate({ _id: req.body.id, business: business }, { $set: data }, { new: true }, function (err, doc) { });

            if (data.publish == true) {
                var status = 'published';
                var isPublished = true;
            } else {
                var status = "unpublished";
                var isPublished = false;
            }

            const totalProductCount = await BusinessProduct.count({ business: business }).exec();
            const publishedProductCount = await BusinessProduct.count({ business: business, publish: true }).exec();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Product has been " + status,
                responseData: {
                    total: totalProductCount,
                    published: publishedProductCount,
                    publish: isPublished,
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

/**
 * [Add Product Images (AWS S3)]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/product/image/add', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/product',
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
                        responseCode: 400,
                        responseMessage: "Invalid extension",
                        responseData: {
                            res: {
                                next: "",
                                errors: "",
                                rld: false
                            },
                        }
                    });
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

        if (req.files.length == 0) {
            var json = ({
                responseCode: 400,
                responseMessage: "Media is required",
                responseData: {}
            });
            res.status(400).json(json)
        } else {

            var rules = {
                id: 'required'
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
                var data = {
                    product: req.body.id,
                    file: req.files[0].key,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                var productImage = new ProductImage(data);
                productImage.save();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "File has been uploaded",
                    responseData: {
                        item: productImage
                    }
                })
            }
        }
    });
});

/**
 * [Remove Product Images (AWS S3)]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.delete('/product/image/delete', xAccessToken.token, async function (req, res, next) {
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

        var image_id = req.body.id;
        const media = await ProductImage.findById(image_id).exec();

        if (media) {
            var params = {
                Bucket: config.BUCKET_NAME + "/product",
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
                    var deleteImage = ProductImage.findByIdAndRemove(image_id).exec();
                    if (deleteImage) {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "File has been deleted",
                            responseData: {}
                        })
                    } else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {}
                        })
                    }
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Wrong image",
                responseData: {}
            })
        }
    }
});

/**
    * [List Get all business product]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/product', xAccessToken.token, async function (req, res, next) {
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

    //paginate

    var product = [];

    await BusinessProduct.findOne({ business: business })
        .populate('bookmark')
        .populate('thumbnails')
        .populate({ path: 'category' })
        .populate({ path: 'business', select: 'name username avatar avatar_address address' })
        .limit(config.perPage).skip(config.perPage * page)
        .cursor().eachAsync(async (p) => {
            product.push({
                _id: p._id,
                id: p.id,
                title: p.title,
                discount: p.discount,
                description: p.description,
                price: p.price,
                model_no: p.model_no,
                category: p.category,
                detail: p.detail,
                thumbnails: p.thumbnails,
                business: p.business,
                bookmark: p.bookmark,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('LL'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('LL'),
            })
        });

    const totalProductCount = await BusinessProduct.count({ business: business }).exec();

    const publishedProductCount = await BusinessProduct.count({ business: business, publish: true }).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            total: totalProductCount,
            published: publishedProductCount,
            products: product,
        }
    })
});



//-------------------------END OF PRODUCT API----------------------------


//-------------------------START OF OFFER API----------------------------

/**
    * [Add Offer]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/offer/add', xAccessToken.token, async function (req, res, next) {

    console.log("Api Offer add Called  ")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = await User.findById(decoded.user).exec();
    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/offer',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];

                cb(null, uuidv1() + '.' + extension);
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, uuidv1() + '.' + extension);
                }
                else {
                    var json = ({
                        responseCode: 422,
                        responseMessage: "Invalid extension",
                        responseData: {
                            res: {
                                next: extension,
                                errors: "",
                                rld: false
                            },
                        }
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
        }
        else {

            req.body.business = business._id;
            req.body.image = req.files[0].key;
            req.body.geometry = business.geometry;
            req.body.isCarEager = business.isCarEager;
            req.body.created_at = new Date();
            req.body.updated_at = new Date();

            BusinessOffer.create(req.body).then(function (offer) {
                return res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Offer has been added",
                    responseData: {
                        item: offer,
                    }
                });
            }).catch(next);
        }
    });
});

/**
    * [Edit Offer]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.put('/offer/edit', xAccessToken.token, async function (req, res, next) {
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
        var check = await BusinessOffer.find({ _id: req.body.id, business: business }).count().exec();
        if (check == 1) {
            var data = {
                offer: req.body.offer,
                description: req.body.description,
                valid_till: req.body.valid_till,
                updated_at: new Date()
            };

            BusinessOffer.findOneAndUpdate({ _id: req.body.id, business: business }, { $set: data }, { new: true }, function (err, doc) {
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
                        responseMessage: "Offer has been edited",
                        responseData: {
                            item: doc,
                        }
                    });
                    res.status(200).json(json)
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

/**
    * [Publish Offer]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.put('/offer/publish', xAccessToken.token, async function (req, res, next) {
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
        var check = await BusinessOffer.find({ _id: req.body.id, business: business }).count().exec();
        if (check == 1) {
            var offer_id = req.body.id;

            BusinessOffer.findOne({ _id: offer_id, business: business }).exec().then(async function (result) {
                return result;
            }).then(function (result) {
                if (result.publish == false) {
                    var status = true;
                } else {
                    var status = false
                }
                var data = {
                    publish: status,
                };

                BusinessOffer.findOneAndUpdate({ _id: req.body.id, business: business }, { $set: data }, { new: true }, function (err, doc) { });
                return status;
            }).then(function (result) {
                BusinessOffer.count({ business: business, publish: true }, async function (err, count) {
                    if (result == 1) {
                        var status = 'published';
                        var isPublished = true;
                    } else {
                        var status = "unpublished";
                        var isPublished = false;
                    }

                    const totalOfferCount = await BusinessOffer.count({ business: business }).exec();

                    const publishedOfferCount = await BusinessOffer.count({ business: business, publish: true }).exec();

                    var json = ({
                        responseCode: 200,
                        responseMessage: "Offer has been " + status,
                        responseData: {
                            total: totalOfferCount,
                            published: publishedOfferCount,
                            publish: isPublished,
                        }
                    });
                    res.status(200).json(json)
                })
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
    * [Business Offer]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/offer', xAccessToken.token, async function (req, res, next) {
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
    var offer = await BusinessOffer.find({ business: business }).populate('bookmark').limit(config.perPage).skip(config.perPage * page).exec();
    const totalOfferCount = await BusinessOffer.count({ business: business }).exec();

    const publishedOfferCount = await BusinessOffer.count({ business: business, publish: true }).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            total: totalOfferCount,
            published: publishedOfferCount,
            offers: offer,
        }
    })
});

/**
    * [Add Business Offer]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/offer/image/add', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/offer',
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
                        responseCode: 400,
                        responseMessage: "Invalid extension",
                        responseData: {}
                    });
                    res.status(400).json(json)
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
            const media = await BusinessOffer.findById(req.body.id).exec();

            if (media) {
                var params = {
                    Bucket: config.BUCKET_NAME + "/offer",
                    Key: media.image
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
                        var data = {
                            image: req.files[0].key,
                        };

                        BusinessOffer.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, function (err, doc) {
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Offer image has been updated",
                                responseData: {
                                    item: doc
                                }
                            })
                        });
                    }
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Wrong image",
                    responseData: {}
                })
            }
        }
    });
});

/**
    * [Delete Offer Image]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.delete('/offer/image/delete', xAccessToken.token, async function (req, res, next) {
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
        const media = await BusinessOffer.findById(req.body.id).exec();

        if (media) {
            var params = {
                Bucket: config.BUCKET_NAME + "/offer",
                Key: media.image
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
                    var data = {
                        image: 'default.png',
                    };
                    BusinessOffer.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, function (err, doc) {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Image has been delete",
                            responseData: {}
                        })
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Wrong image",
                responseData: {}
            })
        }
    }
});

//-------------------------END OF OFFER API----------------------------

/**
    * [Add Business Gallery]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/gallery/update', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/gallery',
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
                        responseCode: 400,
                        responseMessage: "Invalid extension",
                        responseData: {}
                    });
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

        if (req.files.length == 0) {
            var json = ({
                responseCode: 400,
                responseMessage: "Media is required",
                responseData: {}
            });
            res.status(400).json(json)
        } else {
            var data = {
                business: decoded.user,
                file: req.files[0].key,
                created_at: new Date(),
                updated_at: new Date()
            };

            var businessGallery = new BusinessGallery(data);
            businessGallery.save();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been uploaded",
                responseData: {
                    item: businessGallery,
                }
            })
        }
    });
});

/**
 * [Remove Product Images (AWS S3)]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.delete('/gallery/delete', xAccessToken.token, async function (req, res, next) {
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

        var image_id = req.body.id;
        const media = await BusinessGallery.findById(image_id).exec();

        if (media) {
            var params = {
                Bucket: config.BUCKET_NAME + "/gallery",
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
                    var deleteImage = BusinessGallery.findByIdAndRemove(image_id).exec();
                    if (deleteImage) {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "File has been deleted",
                            responseData: {},
                        })
                    } else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {},
                        })
                    }
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Wrong image",
                responseData: {}
            })
        }
    }
});


/**
    * [Update Location]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.put('/location/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    const count = await User.count({ _id: decoded.user }).exec();

    if (count == 1) {
        var data = {
            geometry: [req.body.latitude, req.body.longitude],
            address: {
                location: req.body.location,
            },
        };

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
                    responseMessage: "Location has been updated",
                    responseData: {}
                });
                res.status(200).json(json)
            }
        })
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
                email: req.body.secondary_email,
                contact_no: req.body.secondary_contact_no,
                overview: req.body.overview,
            },
        };

        var rules = {
            name: 'required',
        };

        var validation = new Validator(data, rules);

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



/**
    * [Update Business Timing]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.put('/timing/update', xAccessToken.token, async function (req, res, next) {

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var timing = req.body;

    var business = decoded.user;

    BusinessTiming.remove({ business: business }, function (err) {
        if (!err) {
            timing.timing.forEach(function (u) {
                var timing = new BusinessTiming({
                    business: business,
                    day: u.day,
                    open: u.open,
                    close: u.close,
                    is_closed: u.is_closed,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                timing.save();
            });

            var json = ({
                responseCode: 200,
                responseMessage: "Timing has been updated",
                responseData: {}
            });
            res.status(200).json(json)
        }
        else {
            var json = ({
                responseCode: 400,
                responseMessage: "Error Occurred",
                responseData: {}
            });
            res.status(400).json(json)
        }
    });
});


/**
 * [Claim Business API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/search', async function (req, res, next) {

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var query = req.query.query;

    var business = await User.find({ 'name': new RegExp(query, 'i') }).limit(config.perPage).skip(config.perPage * page).exec();

    return res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: business,
    });
});


/**
 * [Business Analytics API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/analytic', async function (req, res, next) {

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = decoded.user;

    if (req.query.from == '' || req.query.to == '') {
        var stock = await Car.count({ user: business }).exec();
        var publishedStockCount = await Car.count({ user: business }).exec();

        var product = await BusinessProduct.count({ business: business }).exec();
        var publishedProductCount = await BusinessProduct.count({ business: business, publish: true }).exec();

        var offer = await BusinessOffer.count({ business: business }).exec();
        var publishedOfferCount = await BusinessProduct.count({ business: business, publish: true }).exec();

        var review = await Review.count({ business: business }).exec();
    } else {
        var stock = await Car.count({ user: business, "created_at": { "$gte": req.query.from, "$lt": req.query.to } }).exec();
        var publishedStockCount = await Car.count({ user: business, publish: true, "created_at": { "$gte": req.query.from, "$lt": req.query.to } }).exec();

        var product = await BusinessProduct.count({ business: business, "created_at": { "$gte": req.query.from, "$lt": req.query.to } }).exec();
        var publishedProductCount = await BusinessProduct.count({ business: business, publish: true, "created_at": { "$gte": req.query.from, "$lt": req.query.to } }).exec();

        var offer = await BusinessOffer.count({ business: business, "created_at": { "$gte": req.query.from, "$lt": req.query.to } }).exec();
        var publishedOfferCount = await BusinessProduct.count({ business: business, publish: true, "created_at": { "$gte": req.query.from, "$lt": req.query.to } }).exec();

        var review = await Review.count({ business: business, "created_at": { "$gte": req.query.from, "$lt": req.query.to } }).exec();
    }

    return res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: {
            carsStock: stock,
            productsStock: product,
            publishedCar: publishedStockCount,
            publishedProduct: publishedProductCount,
            offers: offer,
            views: 0,
            ratings: 0,
            reviews: review,
            bookings: 0,
            leads: 0,
        },
    });
});




module.exports = router
