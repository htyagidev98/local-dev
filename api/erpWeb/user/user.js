var mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router(),
    config = require('../../../config'),
    businessFunctions = require('../businessFunctions'),
    bcrypt = require('bcrypt-nodejs'),
    assert = require('assert'),
    jwt = require('jsonwebtoken'),
    aws = require('aws-sdk'),
    multerS3 = require('multer-s3'),
    uuidv1 = require('uuid/v1'),
    Validator = require('validatorjs'),
    multer = require('multer'),
    moment = require('moment-timezone'),
    redis = require('redis'),
    FCM = require('fcm-node'),
    q = require('q'),
    xlsxtojson = require("xlsx-to-json-lc"), //Abhinav
    xlstojson = require("xls-to-json-lc"), //Abhinav
    // bodyParser = require('body-parser'),       //Abhinav
    request = require('request');
var ejs = require("ejs");
var pdf = require("html-pdf");
var path = require("path");

// app.use(bodyParser.json());
//webpush = require('web-push');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});


var client = redis.createClient({ host: 'localhost', port: 6379 });

const xAccessToken = require('../../../middlewares/xAccessTokenBusiness');
const fun = require('../../function');
const event = require('../../event');
const whatsAppEvent = require('../../whatsapp/whatsappEvent')
var paytm_config = require('../../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../../paytm/checksum');

var salt = bcrypt.genSaltSync(10);
const User = require('../../../models/user');
const BusinessTiming = require('../../../models/businessTiming');
const BusinessConvenience = require('../../../models/businessConvenience');
const BookingTiming = require('../../../models/bookingTiming');
// const Type = require('../../../models/type');
// const BusinessType = require('../../../models/businessType');
const Category = require('../../../models/category');
const Automaker = require('../../../models/automaker');
const Model = require('../../../models/model');
const QuotationOrders = require('../../../models/quotationOrders')
const OrderLogs = require('../../../models/orderLogs')
const State = require('../../../models/state');
const BookingCategory = require('../../../models/bookingCategory');
const ProductImage = require('../../../models/productImage');
const Country = require('../../../models/country');
const BusinessOffer = require('../../../models/businessOffer');
const BusinessUser = require('../../../models/businessUser');
const ProductOffer = require('../../../models/productOffer');
const Order = require('../../../models/order');
const BusinessOrder = require('../../../models/businessOrder');
const OrderLine = require('../../../models/orderLine');
const OrderConvenience = require('../../../models/orderConvenience');
const OrderInvoice = require('../../../models/orderInvoice');
const BookmarkProduct = require('../../../models/bookmarkProduct');
const BookmarkOffer = require('../../../models/bookmarkOffer');
const Car = require('../../../models/car');
const CarSell = require('../../../models/carSell');
const Asset = require('../../../models/asset');
const CarImage = require('../../../models/carImage');
const CarDocument = require('../../../models/carDocument');
const BookmarkCar = require('../../../models/bookmarkCar');
const BodyStyle = require('../../../models/bodyStyle');
const FuelType = require('../../../models/fuelType');
const Transmission = require('../../../models/transmission');
const Color = require('../../../models/color');
const Owner = require('../../../models/owner');
const ServiceGallery = require('../../../models/serviceGallery'); //abhinav
const BusinessGallery = require('../../../models/businessGallery');
const Variant = require('../../../models/variant');
const ClaimBusiness = require('../../../models/claimBusiness');
const Review = require('../../../models/review');
const Battery = require('../../../models/battery');
const BatteryBrand = require('../../../models/batteryBrand');
const TyreSize = require('../../../models/tyreSize');
const Booking = require('../../../models/booking');
const Lead = require('../../../models/lead');
const Service = require('../../../models/service');
const Customization = require('../../../models/customization');
const Collision = require('../../../models/collision');
const Washing = require('../../../models/washing');
const ProductCategory = require('../../../models/productCategory');
const Product = require('../../../models/product');
const ProductBrand = require('../../../models/productBrand');
const ProductModel = require('../../../models/productModel');
const BusinessProduct = require('../../../models/businessProduct');
const LeadRemark = require('../../../models/leadRemark');
const LeadGenRemark = require('../../../models/leadGenRemark');
const LeadStatus = require('../../../models/leadStatus');
const Package = require('../../../models/package');
const UserPackage = require('../../../models/userPackage');
const PackageUsed = require('../../../models/packageUsed');
const Management = require('../../../models/management');
const LeadManagement = require('../../../models/leadManagement');
const Address = require('../../../models/address');
const Gallery = require('../../../models/gallery');
const Coupon = require('../../../models/coupon');
const Detailing = require('../../../models/detailing');
const CouponUsed = require('../../../models/couponUsed');
const Purchase = require('../../../models/purchase');
const PurchaseReturn = require('../../../models/purchaseReturn');
const PurchaseOrder = require('../../../models/purchaseOrder');
const Tax = require('../../../models/tax');
const BusinessVendor = require('../../../models/businessVendor');
const JobInspection = require('../../../models/jobInspection');
const ClubMember = require('../../../models/clubMember');
const InsuranceCompany = require('../../../models/insuranceCompany');
const LabourRate = require('../../../models/labourRate');
const Point = require('../../../models/point');
const QualityCheck = require('../../../models/qualityCheck');
const Invoice = require('../../../models/invoice');
const Expense = require('../../../models/expense');
const Estimate = require('../../../models/estimate');
const StockLogs = require('../../../models/stockLogs');
// Vinay Model added
const VendorOrders = require('../../../models/vendorOrders');

const TransactionLog = require('../../../models/transactionLog');
const Statements = require('../../../models/statements');
const RFQ = require('../../../models/rfq');
const Quotation = require('../../../models/quotation');
const BusinessPlan = require('../../../models/businessPlan');
const Referral = require('../../../models/referral');
const ManagementRole = require('../../../models/managementRole');
const Location = require('../../../models/location');
const BusinessSetting = require('../../../models/businessSetting');
const ExpenseCategory = require('../../../models/expenseCategory');
const ReviewPoint = require('../../../models/reviewPoint');
const LeadGen = require('../../../models/leadGen');
const SuitePlan = require('../../../models/suitePlan');
const { updateMany } = require('../../../models/user');
const { filter, rangeRight } = require('lodash');
const Sales = require('../../../models/sales');



var secret = config.secret;
var Log_Level = config.Log_Level

router.put('/timing/update', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {
            var timings = req.body;

            BusinessTiming.remove({ business: business }, function (err) {
                if (!err) {
                    if (timings.length > 0) {
                        timings.forEach(function (u) {
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

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Timing has been updated",
                            responseData: {}
                        })
                    }
                    else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Timing is not formatted",
                            responseData: {}
                        })
                    }
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error Occurred",
                        responseData: {}
                    })
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
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

router.post('/offer/add', xAccessToken.token, async function (req, res, next) {
    // console.log("Offer Add")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    // console.l.l.log("API Called")

    var data = [];
    var multi_category_no = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 5);
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

                var filename = uuidv1() + '.' + extension;
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, filename);
                }
                else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/offer",
                        Key: filename
                    };
                    s3.deleteObject(params, async function (err, data) {
                        var json = ({
                            responseCode: 422,
                            responseMessage: "Invalid extension",
                            responseData: {}
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
        }
        else {
            var expired_at = new Date(req.body.sDate);
            expired_at.setDate(expired_at.getDate() + parseInt(req.body.validity));
            // console.l.l.log("Multi " + multi_category_no)
            req.body.multi_category = multi_category_no;
            req.body.business = business;
            req.body.image = req.files[0].key;
            req.body.geometry = business.geometry;
            req.body.isCarEager = business.isCarEager;
            //Abhinav 
            req.body.name = req.body.name;
            req.body.offer = req.body.name;
            req.body.description = req.body.description;
            req.body.terms = req.body.terms;
            req.body.code = req.body.code;
            req.body.limit = req.body.limit;

            req.body.start_date = new Date(req.body.sDate).toISOString()
            req.body.valid_till = expired_at
            req.body.end_date = expired_at
            // req.body.featured = req.body.featured;
            req.body.featured = false;
            req.body.publish = true;
            req.body.validity = parseInt(req.body.validity)
            //Abhinav
            req.body.discount = req.body.discount;
            req.body.created_at = new Date();
            req.body.updated_at = new Date();
            var ser = []
            ser = req.body.category.split(',');
            if (ser.length == 1) {
                var ser = []
                ser.push(req.body.category)
            }

            console.log("Length  = " + JSON.stringify(ser, null, '\t'))



            //WEBSITE
            // req.body.offer_details.category = req.body.category;
            // req.body.offer_details.description =req.body.type
            // req.body.offer_details.terms = ""
            // console.l.l.log("Length of Coupon = " + ser.length)

            for (i = 0; i < ser.length; i++) {

                req.body.category = ser[i];
                if (req.body.category == "services") {
                    req.body.category = "service"
                }
                // console.l.l.log("Service " + ser[i])
                BusinessOffer.create(req.body).then(function (offer) {
                    // console.l.l.log(offer.category)
                    if (offer.category == "service") {
                        offer.category = "services"
                    }
                    if (offer.code != '') {
                        // console.l.l.log("With Code")
                        Coupon.create({
                            for: "category",
                            type: "percent",
                            label: offer.category,
                            usage_limit: 1,
                            physical: false,
                            code: offer.code,
                            business: offer.business,
                            offer: offer._id,
                            discount: offer.discount,
                            // discount: 30,
                            publish: true,
                            limit: offer.limit,
                            terms: offer.terms,
                            description: offer.description,
                            start_date: new Date(req.body.sDate).toISOString(),
                            expired_at: expired_at.toISOString(),
                            created_at: new Date(offer.start_date),
                        }).then(function (offer11) {

                        })
                    }
                });

            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Offer has been added",
                responseData: {
                    name: req.body.name,
                    multi_category_no: multi_category_no
                }
            });

        }
    });
});

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
            var expired_at = new Date();
            expired_at.setDate(expired_at.getDate() + parseInt(req.body.validity));
            var ser = []

            // if (req.body.category == "all") {
            //     ser = ['service', 'detailing', 'customization', 'collision']
            // } else {
            //     ser = [req.body.category];
            // }
            // console.l.l.log("Discount " + req.body.discount)
            var data = {
                offer: req.body.name,
                // description: req.body.description,
                // valid_till: req.body.valid_till,
                updated_at: new Date(),

                name: req.body.name,
                offer: req.body.name,
                description: req.body.description,
                code: req.body.code,
                limit: req.body.limit,
                category: req.body.category,
                discount: req.body.discount,
                terms: req.body.terms,
                // start_date = new Date(req.body.sDate).toISOString(),
                valid_till: expired_at.toISOString(),
                // req.body.valid_till = expired_at,
                featured: req.body.featured,
                publish: true,
                validity: parseInt(req.body.validity)
            };



            //WEBSITE
            // req.body.offer_details.category = req.body.category;
            // req.body.offer_details.description =req.body.type
            // req.body.offer_details.terms = ""


            // console.l.l.log("Length of Coupon = " + ser.length)
            // for (i = 0; i < ser.length; i++) {

            //     req.body.category = ser[i];
            // console.l.l.log("Service " + ser[i])
            // }


            BusinessOffer.findOneAndUpdate({ _id: req.body.id, business: business }, { $set: data }, { new: true }, function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });

                    res.status(400).json(json)
                } else {

                    if (doc.code != '') {
                        // console.l.l.log("Offer Updated " + doc.name)
                        if (doc.category == "service") {
                            doc.category = "services"
                        }
                        Coupon.findOneAndUpdate({ offer: req.body.id, business: business }, {
                            $set: {
                                offer: doc.id,
                                for: "category",
                                type: "percent",
                                label: doc.category,
                                description: doc.description,
                                usage_limit: 1,
                                physical: false,
                                code: doc.code,
                                business: doc.business,
                                terms: doc.terms,
                                discount: doc.discount,
                                publish: true,
                                limit: doc.limit,
                                // start_date: new Date(req.body.sDate).toISOString(),
                                expired_at: expired_at,

                                updated_at: new Date
                            }
                        }, { new: true }, function (err, cop) {
                            if (err) {
                                var json = ({
                                    responseCode: 400,
                                    responseMessage: "Error occured",
                                    responseData: {}
                                });

                                res.status(400).json(json)
                            } else {
                                // console.l.l.log("Coupon Updated" + cop.limit)
                            }
                        })
                    }
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
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

router.put('/offer/pause/resume', async function (req, res, next) {
    var rules = {
        offer: "required",
        publish: "required",
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
        var data = [];
        var token = req.headers['x-access-token'];
        var business = req.headers['business'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        await BusinessOffer.findOneAndUpdate({ _id: req.body.offer, business: business }, {
            $set:
            {
                publish: req.body.publish
            }
        }, { new: true }, function (err, doc) {
            if (err) {
                var json = ({
                    responseCode: 400,
                    responseMessage: "Error occured",
                    responseData: {}
                });

                res.status(400).json(json)
            } else {
                // console.l.l.log("Offer Updated " + doc.name)
                if (doc.code != '') {
                    Coupon.findOneAndUpdate({ offer: req.body.offer, business: business }, {
                        $set: {
                            publish: req.body.publish
                        }
                    }, { new: true }, function (err, cop) {
                        if (err) {
                            var json = ({
                                responseCode: 400,
                                responseMessage: "Error occured",
                                responseData: {}
                            });

                            res.status(400).json(json)
                        } else {

                        }
                    })
                }
            }
        });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Success",
            responseData: {}
        })
    }
});

router.post('/featured/image/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    // console.l.l.log("API Called")
    var data = [];
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

                var filename = uuidv1() + '.' + extension;
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, filename);
                }
                else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/offer",
                        Key: filename
                    };
                    s3.deleteObject(params, async function (err, data) {
                        var json = ({
                            responseCode: 422,
                            responseMessage: "Invalid extension",
                            responseData: {}
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
        }
        else {
            // BusinessOffer.findOneAndUpdate({ _id: req.body.offer, business: business }, {
            //     $set:
            //     {
            //         featured_image: req.files[0].key,
            //     }
            // }).exec();

            BusinessOffer.findOneAndUpdate({ multi_category: req.body.multiCategory, business: business }, {
                $set:
                {
                    featured_image: req.files[0].key,
                    featured: true
                }
            }).exec();
            // }, { new: true }, function (err, doc) {
            //     if (err) {
            //         var json = ({
            //             responseCode: 400,
            //             responseMessage: "Error occured",
            //             responseData: {}
            //         });

            //         res.status(400).json(json)
            //     } else {

            //     }

            // console.l.l.log("Publish Changed")
            // });

        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Offer Status Changed",
            responseData: {}
        })
    });
});

router.delete('/qr-code/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {
            var info = await User.findById(business).exec()

            var file = info.business_info.qr_code;

            var x = file.split("avatar/");

            if (x[1]) {
                var params = {
                    Bucket: config.BUCKET_NAME + "/avatar",
                    Key: x[1]
                };

                // console.l.l.log(params);

                s3.deleteObject(params, async function (err, data) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Invalid extension",
                            responseData: {}
                        })
                    }
                    else {
                        User.findOneAndUpdate({ _id: business }, { $set: { "business_info.qr_code": "" } }, { new: false }, async function (err, doc) {
                            if (err) {
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Invalid extension",
                                    responseData: {}
                                });
                            }
                            else {
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "Deleted Successfully",
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
                    responseMessage: "File not Found",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
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
                    // BusinessOffer.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: true }, function (err, doc) {
                    //     res.status(200).json({
                    //         responseCode: 200,
                    //         responseMessage: "Image has been delete",
                    //         responseData: {}
                    //     })
                    // });
                    BusinessOffer.remove({ _id: req.body.id }).exec();
                    Coupon.remove({ offer: req.body.id }).exec();
                    // console.l.l.log("Removed")
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Offer deleted",
                        responseData: {}
                    })

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

                var filename = uuidv1() + '.' + extension;
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, filename);
                }
                else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/gallery",
                        Key: filename
                    };
                    s3.deleteObject(params, async function (err, data) {
                        var json = ({
                            responseCode: 422,
                            responseMessage: "Invalid extension",
                            responseData: {}
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

router.get('/vendor/details/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /vendor/details/get Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var loggedInDetails = await User.findById(decoded.user).exec();
    var product = new Object();
    var result = [];

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Vendor Details, VendorId:" + req.query.user);
    }
    var user = await User.findById(req.query.user).exec();
    if (user) {
        var address = await Address.find({ user: user._id }).exec();
        var info = {
            _id: user.id,
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            contact_no: user.contact_no,
            avatar: user.avatar,
            avatar_address: user.avatar_address,
            business_info: user.business_info,
            bank_details: user.bank_details,
            account_info: user.account_info,
            address: address,
        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: info
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Vendor Details Send in Response Successfully, Vendor_Name:" + user.name + ", User:" + loggedInDetails.name);
        }

    }
    else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Vendor not found for the vendorId:" + req.query.user + ", User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Vendor not found",
            responseData: {}
        });
    }
});

router.get('/address/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /address/get Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    var user = await User.findById(req.query.user);
    if (user) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Address details in Response, Name:" + user.name + ", " + "User:" + loggedInDetails.name);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Address",
            responseData: await Address.find({ user: user._id }).exec()
        })
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Address details send successfully in Response, Name:" + user.name + ", " + "User:" + loggedInDetails.name);
        }
    }
    else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: User Not Found with UserId:" + req.query.user + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        })
    }
});

router.post('/address/add', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /address/add Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var rules = {
        user: 'required',
        address: 'required',
        zip: 'required',
        city: 'required',
        state: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, All fields are required to add address.");
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
            businessFunctions.logs("DEBUG: Validated successfully and Fatching user details to add address for the user, UserId:" + req.body.user);
        }
        var user = await User.findById(req.body.user);
        if (user) {
            var data = {
                user: user._id,
                address: req.body.address,
                area: req.body.area,
                landmark: req.body.landmark,
                zip: req.body.zip,
                city: req.body.city,
                state: req.body.state,
                created_at: new Date(),
                updated_at: new Date()
            };
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Add New address for the user, Name:" + user.name);
            }
            Address.create(data).then(async function (address) {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Address Updated",
                    responseData: address
                })
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Address added successfully, Name:" + user.name);
                }
            });
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: User not found with the given userId, UserId:" + req.body.user);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User not found",
                responseData: {}
            });
        }
    }
});

router.post('/owner/add', async function (req, res, next) {
    businessFunctions.logs("INFO: /owner/add Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    if (req.body.user) {
        var user = await User.findOne({ _id: req.body.user }).exec();
        if (user) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: {
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    user: user._id,
                    contact_no: user.contact_no
                },
            });
        }
    }
    else {
        var rules = {
            contact_no: 'required',
            name: 'required',
        };

        var validation = new Validator(req.body, rules);

        if (validation.fails()) {
            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                businessFunctions.logs("ERROR: Validation failed, Mobile No. and name is required");
            }
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Mobile No. and name is required",
                responseData: {
                    res: validation.errors.all()
                }
            })
        }
        else {
            var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "user" }).count().exec();
            if (checkPhone == 0) {
                var otp = Math.floor(Math.random() * 90000) + 10000;
                req.body.username = shortid.generate();
                req.body.socialite = {};
                req.body.business_info = {};
                req.body.optional_info = {};


                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Fatching Country details," + " " + "TimeZone:" + req.headers['tz']);
                }
                var country = await Country.findOne({ timezone: { $in: req.headers['tz'] } }).exec();
                req.body.address = {
                    country: country.countryName,
                    timezone: req.headers['tz'],
                    location: req.body.location,
                };

                req.body.account_info = {
                    type: "user",
                    status: "Complete",
                    phone_verified: false,
                    verified_account: false,
                    approved_by_admin: false,
                };

                req.body.geometry = [0, 0];

                req.body.device = [];
                req.body.otp = otp;
                req.body.uuid = uuidv1();
                req.body.business_info = {};

                var firstPart = (Math.random() * 46656) | 0;
                var secondPart = (Math.random() * 46656) | 0;
                firstPart = ("000" + firstPart.toString(36)).slice(-3);
                secondPart = ("000" + secondPart.toString(36)).slice(-3);
                req.body.referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();

                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Creating New User," + " " + "Contact_no:" + req.body.contact_no);
                }
                User.create(req.body).then(async function (user) {
                    // event.signupSMS(user);
                    //event.otpSms(user);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "success",
                        responseData: {
                            _id: user._id,
                            id: user._id,
                            name: user.name,
                            email: user.email,
                            user: user._id,
                            contact_no: user.contact_no
                        },
                    });
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO: User Created Successfully," + " " + "Name:" + user.name + ", " + "C/ontact_no:" + req.body.contact_no);
                    }
                });
            }
            else {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING: Contact no already exist," + " " + "contact_no:" + req.body.contact_no);
                }
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Contact no already exist",
                    responseData: {}
                })
            }
        }
    }
});

router.get('/user/cars/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/user/cars/get Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();
    var car = []
    var currentDate = new Date();

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching car Details for the given user, UserId:" + req.query.user + ", " + "User:" + user.name);
    }
    await Car.find({ user: req.query.user, status: true })
        .populate('bookmark')
        .populate('thumbnails')
        .populate({ path: 'user', select: 'name username avatar avatar_address address' })
        .populate({ path: 'variant', populate: { path: 'model' } })
        .sort({ created_at: -1 })
        .cursor().eachAsync(async (doc) => {

            car.push({
                __v: 0,
                _id: doc._id,
                id: doc.id,
                title: doc.title,
                variant: doc.variant._id,
                model: doc.model,
                modelName: doc.variant.model.model,
                price: doc.price,
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
                transmission: doc.transmission,
                vehicle_color: doc.vehicle_color,
                vehicle_status: doc.vehicle_status,
                geometry: doc.geometry,
                fuel_level: doc.fuel_level,
                engine_no: doc.engine_no,
                vin: doc.vin,
                ic: doc.ic,
                rc: doc.rc,
                ic_address: doc.ic_address,
                rc_address: doc.rc_address,
                publish: doc.publish,
                status: doc.status,
                premium: doc.premium,
                is_bookmarked: doc.is_bookmarked,
                thumbnails: doc.thumbnails,
                user: doc.user,
                insurance_info: doc.insurance_info,
                created_at: doc.created_at,
                updated_at: doc.updated_at
            });
        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Car Details in Response, UserId:" + req.query.user + ", " + "User:" + user.name);
    }
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: car
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Car Details Send in Response Successfully, UserId:" + req.query.user + ", " + "User:" + user.name);
    }
});

router.get('/user/search/', xAccessToken.token, async function (req, res, next) {
    var rules = {
        query: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Query is required.");
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
        var user = decoded.user;
        var business = req.headers['business'];
        var user = await User.findById(decoded.user).exec();
        var peoples = [];
        var filters = [];


        /*var specification = {};        
        specification['$lookup']= {
            from: "Booking",
            localField: "bookings",
            foreignField: "_id",
            as: "bookings",
        };
        filters.push(specification); */
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and Making Aggregation query, for User:" + " " + req.query.query);
        }
        var specification = {};
        specification['$lookup'] = {
            from: "Car",
            localField: "cars",
            foreignField: "_id",
            as: "cars",
        };
        filters.push(specification);



        if (req.query.query) {
            req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

            var specification = {};
            specification['$match'] = {
                $or: [
                    { 'name': { $regex: req.query.query, $options: 'i' } },
                    { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                    {
                        "cars": {
                            $elemMatch: {
                                "title": { $regex: req.query.query, $options: 'i' }
                            }
                        }
                    },
                    {
                        "cars": {
                            $elemMatch: {
                                "registration_no": { $regex: req.query.query, $options: 'i' }
                            }
                        }
                    },
                ]
            };
            filters.push(specification);


            var specification = {};
            specification['$sort'] = {
                updated_at: -1,
            };
            filters.push(specification);
        }

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and Fatching User Details," + " " + req.body.query);
        }
        await User.aggregate(filters)
            .allowDiskUse(true)
            .cursor({ batchSize: 10 })
            .exec()
            .eachAsync(async function (user) {
                var b = await Booking.find({ business: business, user: user._id }).count();
                var l = await Lead.find({ business: business, user: user._id }).count();
                var o = await BusinessOrder.find({ business: business, user: user._id }).count();
                var s = await Sales.find({ business: business, user: user._id }).count();
                if (b > 0 || l > 0 || o > 0 || s > 0) {
                    peoples.push({
                        _id: user._id,
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        contact_no: user.contact_no,
                        avatar: user.avatar,
                        avatar_address: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/avatar/" + user.avatar,
                        account_info: user.account_info,
                        business_info: user.business_info,
                        created_at: user.created_at,
                        updated_at: user.updated_at,
                        joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    });
                }
            });
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending User Details in Response, Query:" + req.query.query + ", " + "User:" + user.name);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseInfo: {
                //filters:filters
            },
            responseData: peoples,
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: User Details Send in Response Successfully," + " "
                + "User:" + user.name);
        }
    }
});

router.get('/user/details', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /user/details Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        query: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, User Id is required in the query.");
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
        var user = decoded.user;
        var business = req.headers['business'];
        var user = await User.findById(decoded.user).exec();
        var peoples = [];

        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));

        var query = req.query.query;

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully And Getting the details of user.");
        }
        await User.find({ '_id': req.query.query })
            .select('name username avatar avatar_address contact_no email careager_cash account_info business_info address created_at')
            .sort({ created_at: -1 }).limit(config.perPage)
            .skip(config.perPage * page)
            .cursor().eachAsync(async (user) => {
                var date = new Date();
                date.setDate(date.getDate() - 1);
                var bookings = [];
                await Booking.find({
                    user: user._id,
                    status: { $nin: ["Cancelled", "Inactive", "EstimatePrepared"] },
                    is_services: true
                })
                    .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
                    .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
                    .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email " } })
                    .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
                    .populate({ path: 'car', select: '_id id title registration_no ic rc' })
                    .sort({ date: 1 })
                    .cursor().eachAsync(async (booking) => {
                        var car = null;
                        var manager = null;
                        var advisor = null;
                        var address = null;
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("DEBUG: fatching Bookings details," + " " + "Analyst Name:" + user.name);
                        }
                        if (booking.car) {
                            car = {
                                title: booking.car.title,
                                _id: booking.car._id,
                                id: booking.car.id,
                                registration_no: booking.car.registration_no,
                                ic_address: booking.car.ic_address,
                                rc_address: booking.car.rc_address,
                            }
                        }

                        if (booking.manager) {
                            manager = {
                                name: booking.manager.name,
                                _id: booking.manager._id,
                                id: booking.manager.id,
                                contact_no: booking.manager.contact_no,
                                email: booking.manager.email
                            }
                        }

                        if (booking.advisor) {
                            advisor = {
                                name: booking.advisor.name,
                                _id: booking.advisor._id,
                                id: booking.advisor.id,
                                contact_no: booking.advisor.contact_no,
                                email: booking.advisor.email
                            }
                        }

                        if (booking.address) {
                            var address = await Address.findOne({ _id: booking.address }).exec();
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
                                // business_info: booking.user.business_info
                            },
                            business: {
                                name: booking.business.name,
                                _id: booking.business._id,
                                id: booking.business.id,
                                contact_no: booking.business.contact_no,
                                email: booking.business.email
                            },
                            advisor: advisor,
                            manager: manager,
                            services: booking.services,
                            convenience: booking.convenience,
                            date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                            time_slot: booking.time_slot,
                            status: _.startCase(booking.status),
                            booking_no: booking.booking_no,
                            estimation_requested: booking.estimation_requested,
                            address: address,
                            payment: booking.payment,
                            due: booking.due,
                            __v: booking.__v,
                            updated_at: booking.updated_at,
                            updated_at: booking.updated_at,
                        });
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("DEBUG: Push Bookings details in booking array," + " " + "Analyst Name:" + user.name);
                        }
                    });

                var cars = [];
                await Car.find({ user: user._id, status: true })
                    .select('_id id title registration_no rc ic')
                    .cursor().eachAsync(async (car) => {
                        if (car) {
                            cars.push({
                                _id: car._id,
                                id: car._id,
                                title: car.title,
                                registration_no: car.registration_no,
                                rc: car.rc,
                                rc_address: car.rc_address,
                                ic: car.ic,
                                ic_address: car.ic_address,
                            });
                        }
                    });
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Fatch car details and push in cars array successfully," + " " + "Analyst Name:" + user.name);
                }

                var leadId = [];
                var leads = [];

                await Lead.find({ contact_no: user.contact_no, business: business })
                    .populate({ path: 'assignee', select: 'id name contact_no email' })
                    .sort({ updated_at: -1 }).skip(config.perPage * page).limit(config.perPage)
                    .cursor().eachAsync(async (lead) => {
                        if (lead) {
                            var remark = await LeadRemark.findOne({ lead: lead._id }).sort({ created_at: -1 }).exec();
                            leads.push({
                                user: lead.user,
                                name: lead.name,
                                contact_no: lead.contact_no,
                                email: lead.email,
                                _id: lead._id,
                                id: lead.id,
                                type: lead.type,
                                date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                                status: lead.status,
                                important: lead.important,
                                follow_up: lead.follow_up,
                                remark: lead.remark,
                                assignee: lead.assignee,
                                created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                                updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                            });
                        }
                    });
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Fatch leads details and push in leads array successfully," + " " + "Analyst Name:" + user.name);
                }

                var packages = [];
                await UserPackage.find({ user: req.query.query })
                    .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email' })
                    .populate({ path: 'car', select: '_id id title registration_no' })
                    .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
                    .cursor().eachAsync(async (package) => {
                        var discounts = [];
                        package.discount.forEach(async function (discount) {
                            var remain = 0;

                            if (discount.discount != 0) {
                                if (discount.for == "specific") {
                                    var label = discount.label;
                                    var usedPackage = await PackageUsed.findOne({ package: package._id, user: req.query.query, label: discount.label }).count().exec();
                                    remain = discount.limit - usedPackage;
                                }
                                else {
                                    var bookingCategory = await BookingCategory.findOne({ tag: discount.label }).exec();
                                    var label = bookingCategory.title;
                                }

                                discounts.push({
                                    _id: discount._id,
                                    for: discount.for,
                                    label: label,
                                    discount: discount.discount,
                                    type: discount.type,
                                    limit: discount.limit,
                                    remains: remain
                                });
                            }
                        });
                        packages.push({
                            user: package.user,
                            name: package.name,
                            _id: package._id,
                            id: package._id,
                            status: package.status,
                            validity: package.validity,
                            description: package.description,
                            discount: discounts,
                            car: package.car,
                            payment: package.payment,
                            created_at: moment(package.created_at).tz(req.headers['tz']).format('lll'),
                            expired_at: moment(package.expired_at).tz(req.headers['tz']).format('lll'),
                        });
                    })
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Fatch package  details and push in package array successfully," + " " + "Analyst Name:" + user.name);
                }
                // console.l.l.log("Right Place ")
                // console.l.l.log("Moment Date = " + moment(user.created_at).tz(req.headers['tz']).format('ll'))

                // console.l.l.log("created at : " + user.created_at)
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Sending User's All details in Response," + " " + "Analyst Name:" + user.name);
                }
                peoples = {
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    address: user.address,
                    business_info: user.business_info,
                    username: user.username,
                    email: user.email,
                    contact_no: user.contact_no,
                    avatar_address: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/avatar/" + user.avatar,
                    account_info: user.account_info,
                    careager_cash: user.careager_cash,
                    cars: cars,
                    bookings: bookings,
                    leads: leads,
                    package: packages,
                    created_at: user.created_at,
                    updated_at: user.updated_at,

                    joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                };
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: peoples,
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: User's detsils send successfully in response," + " " + "User:" + user.name);
        }
    }
});

// router.get('/user/wallet/get', xAccessToken.token, async function(req, res, next) {
//     var token = req.headers['x-access-token'];
//     var secret = config.secret;
//     var decoded = jwt.verify(token, secret);
//     var user = decoded.user;
//     if (req.headers['business']) {
//         user = req.headers['business'];
//     }
//     var points = [];
//     var total = 0,
//         used = 0;
//     var unused = await User.findOne({ _id: user }).select('careager_cash referral_code').exec();
//     await Point.find({ user: user }).sort({ created_at: -1 }).cursor().eachAsync(async(point) => {
//         if (point.type == "credit") {
//             total = total + point.points;
//         }

//         if (point.type == "debit") {
//             used = used + point.points;
//         }

//         if (point.tag == "commission") {
//             var booking = await Booking.findById(point.source).populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } }).exec();
//             if (booking) {
//                 var booking_no = booking.booking_no;
//                 if (booking.user) {
//                     var name = booking.user.name
//                 } else {
//                     var booking_no = "";
//                     var name = "";
//                 }
//             } else {
//                 var booking_no = "";
//                 var name = "";
//             }
//             var tag = "Commission - " + name + " - #" + booking_no;
//         } else if (point.tag == "referNEarn") {
//             var user = await User.findById(point.source).exec();
//             var tag = "Refer & Earn - " + user.name;
//         } else {
//             var tag = _.startCase(point.tag)
//         }

//         points.push({
//             _id: point._id,
//             points: Math.ceil(point.points),
//             type: point.type,
//             tag: tag,
//             status: point.status,
//             activity: _.startCase(point.activity),
//             user: point.user,
//             month: moment(point.created_at).tz(req.headers['tz']).format('MMMM YYYY'),
//             created_at: moment(point.created_at).tz(req.headers['tz']).format("Do"),
//             updated_at: moment(point.updated_at).tz(req.headers['tz']).format("Do")
//         });
//     });

//     var group = _(points).groupBy(x => x.month).map((value, key) => ({ month: key, transaction: value })).value();

//     var uu = unused.careager_cash;

//     res.status(200).json({
//         responseCode: 200,
//         responseMessage: "success",
//         responseData: {
//             total: Math.ceil(total),
//             used: Math.ceil(used),
//             unused: Math.ceil(uu),
//             referral_code: unused.referral_code,
//             total_refferal: await Referral.find({ owner: user }).count(),
//             list: group
//         }
//     });
// });

router.get('/wallet/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /wallet/get Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (req.headers['business']) {
        user = req.headers['business'];
    }
    var points = [];
    var total = 0,
        used = 0;

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching User Wallet Details, User:" + loggedInDetails.name);
    }
    var unused = await User.findOne({ _id: user }).select('careager_cash referral_code').exec();
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
                } else {
                    var booking_no = "";
                    var name = "";
                }
            } else {
                var booking_no = "";
                var name = "";
            }
            var tag = "Commission - " + name + " - #" + booking_no;
        } else if (point.tag == "referNEarn") {
            var user = await User.findById(point.source).exec();
            var tag = "Refer & Earn - " + user.name;
        } else {
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
            total_refferal: await Referral.find({ owner: user }).count(),
            list: group
        }
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Wallet Details Send in Response Successfully, User:" + loggedInDetails.name);
    }
});

router.get('/user/wallet/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    if (req.headers['business']) {
        user = req.headers['business'];
    }
    var points = [];
    var total = 0, used = 0;
    var unused = await User.findOne({ _id: user }).select('careager_cash referral_code').exec();
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
            referral_code: unused.referral_code,
            total_refferal: await Referral.find({ owner: user }).count(),
            list: group
        }
    });
});

router.put('/job/setting/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {
            var businessSetting = await BusinessSetting.findOne({ business: business }).exec();
            if (businessSetting) {
                req.body.updated_at = new Date();

                BusinessSetting.findOneAndUpdate({ business: business }, { $set: req.body }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {
                        var updated = await BusinessSetting.findOne({ business: business }).exec();
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Business Setting",
                            responseData: updated
                        });
                    }
                });
            }
            else {
                req.body.business = business;
                req.body.created_at = new Date();
                req.body.updated_at = new Date();

                BusinessSetting.create(req.body)
                    .then(async function (e) {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Added",
                            responseData: e
                        });
                    });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
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

router.put('/info/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {
            var data = {
                "business_info.company_name": req.body.company_name,
                "business_info.gst_registration_type": req.body.gst_registration_type,
                "business_info.gstin": req.body.gstin,
                "business_info.policy": req.body.policy,
                "business_info.terms": req.body.terms,
                "business_info.order_terms": req.body.order_terms,
                "business_info.pick_up_limit": req.body.pick_up_limit,
                "updated_at": new Date(),
            }

            User.findOneAndUpdate({ _id: business }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    var updated = await User.findOne({ _id: business }).exec();
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Business Setting",
                        responseData: updated
                    });
                }
            });

        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
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

router.put('/qr-code/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {

            var upload = multer({
                storage: multerS3({
                    s3: s3,
                    bucket: config.BUCKET_NAME + '/avatar',
                    acl: 'public-read',
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                    // contentDisposition: 'attachment',
                    key: function (req, file, cb) {
                        let extArray = file.mimetype.split("/");
                        let extension = extArray[extArray.length - 1];

                        var filename = uuidv1() + '.' + extension;
                        if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                            cb(null, filename);
                        }
                        else {
                            var params = {
                                Bucket: config.BUCKET_NAME + "/avatar",
                                Key: filename
                            };
                            s3.deleteObject(params, async function (err, data) {
                                var json = ({
                                    responseCode: 422,
                                    responseMessage: "Invalid extension",
                                    responseData: {}
                                });
                                res.status(422).json(json)
                            });
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
                    var data = {
                        "business_info.qr_code": 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/avatar/' + req.files[0].key,
                        "updated_at": new Date(),
                    }

                    User.findOneAndUpdate({ _id: business }, { $set: data }, { new: false }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            var updated = await User.findOne({ _id: business }).exec();
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Business Setting",
                                responseData: updated
                            });
                        }
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
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

router.put('/logo/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {

            var upload = multer({
                storage: multerS3({
                    s3: s3,
                    bucket: config.BUCKET_NAME + '/avatar',
                    acl: 'public-read',
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                    // contentDisposition: 'attachment',
                    key: function (req, file, cb) {
                        let extArray = file.mimetype.split("/");
                        let extension = extArray[extArray.length - 1];

                        var filename = uuidv1() + '.' + extension;
                        if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                            cb(null, filename);
                        }
                        else {
                            var params = {
                                Bucket: config.BUCKET_NAME + "/avatar",
                                Key: filename
                            };
                            s3.deleteObject(params, async function (err, data) {
                                var json = ({
                                    responseCode: 422,
                                    responseMessage: "Invalid extension",
                                    responseData: {}
                                });
                                res.status(422).json(json)
                            });
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
                    var data = {
                        "business_info.company_logo": 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/avatar/' + req.files[0].key,
                        "updated_at": new Date(),
                    }

                    User.findOneAndUpdate({ _id: business }, { $set: data }, { new: false }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            var updated = await User.findOne({ _id: business }).exec();
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Business Setting",
                                responseData: updated
                            });
                        }
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
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

router.put('/bank-details/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {
            var data = [{
                "bank": req.body.bank,
                "branch": req.body.branch,
                "ifsc": req.body.ifsc,
                "account_no": req.body.account_no,
                "account_holder": req.body.account_holder,
                "upi_id": req.body.upi_id,
            }]


            await User.findOneAndUpdate({ _id: business }, { $set: { bank_details: data } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    var updated = await User.findOne({ _id: business }).exec();
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Business Setting",
                        responseData: updated
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
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

router.put('/address/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {
            var data = {
                "address.country": req.body.country,
                "address.state": req.body.state,
                "address.zip": req.body.zip,
                "address.area": req.body.area,
                "address.city": req.body.city,
                "address.address": req.body.address,
                "updated_at": new Date(),
            }

            User.findOneAndUpdate({ _id: business }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
                else {
                    var updated = await User.findOne({ _id: business }).exec();
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Business Setting",
                        responseData: updated
                    });
                }
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
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

router.get('/orders/vendors/get', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    let list = []
    let search = req.query.search
    let vendor = []
    // console.l.l.log("Search query..", req.query.search);


    let query = {
        "_id": { $in: list },
    }





    let vendors = await BusinessVendor.find({ business: mongoose.Types.ObjectId(business) }).cursor()
        .eachAsync(async (v) => {
            list.push(mongoose.Types.ObjectId(v.vendor))
        })
    let booking = await Booking.findOne({ _id: req.query.id }).exec()
    await User.find(query)
        .cursor()
        .eachAsync(async (u) => {
            vendor.push(u)
        })


    let data = []
    let parts = []
    let services = booking.services
    let length = vendor.length;


    vendor.forEach(async vendors => {
        let combine = {
            name: vendors.name,
            item: '',
            address: vendors.address.address,
            contact_no: vendors.contact_no,
            id: vendors._id
        }
        data.push(combine)
    })

    for (let j = 0; j < services.length; j++) {
        for (let i = 0; i < services[j].parts.length; i++) {
            let partsData = {
                item: services[j].parts[i].item,
                quantity: services[j].parts[i].quantity
            }
            parts.push(partsData)
        }
    }

    for (let i = 0; i < parts.length; i++) {
        data[i].item = parts[i].item
    }


    res.json({
        suppliers: vendor,
        parts: parts,
        mergeData: data,
        totalParts: parts.length,
        totalSuppliers: vendor.length
    })
})

router.get('/user/package/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var customerId = req.query.user;


    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var packages = [];
    await UserPackage.find({ user: customerId })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email' })
        .populate({ path: 'car', select: '_id id title registration_no' })
        .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
        .cursor().eachAsync(async (package) => {
            var discounts = [];
            package.discount.forEach(async function (discount) {
                var remain = 0;

                if (discount.discount != 0) {
                    if (discount.for == "specific") {
                        var label = discount.label;
                        var usedPackage = await PackageUsed.findOne({ package: package._id, user: customerId, label: discount.label }).count().exec();
                        remain = discount.limit - usedPackage;
                    }
                    else {
                        var bookingCategory = await BookingCategory.findOne({ tag: discount.label }).exec();
                        var label = bookingCategory.title;
                    }

                    discounts.push({
                        _id: discount._id,
                        for: discount.for,
                        label: label,
                        discount: discount.discount,
                        type: discount.type,
                        limit: discount.limit,
                        remains: remain
                    });
                }
            });

            packages.push({
                user: package.user,
                name: package.name,
                _id: package._id,
                id: package._id,
                description: package.description,
                discount: discounts,
                car: package.car,
                payment: package.payment,
                created_at: moment(package.created_at).tz(req.headers['tz']).format('lll'),
                expired_at: moment(package.expired_at).tz(req.headers['tz']).format('lll'),
            });
        })

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Packages",
        responseData: packages
    })
});

router.get('/all/users/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    // console.l.l.log("Called............")
    // console.l.l.l.log("Business Id = " + business)


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



    // if (req.query.query) {
    //     var query = {
    //         $and: [
    //             {
    //                 status: { $in: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] },
    //                 is_services: true,
    //                 // "account_info.type": "user",
    //                 business: business,
    //                 // "account_info.type": "user",
    //                 $or: [
    //                     {
    //                         "name": { $regex: req.query.query, $options: 'i' }
    //                     },
    //                     {
    //                         "contact_no": { $regex: req.query.query, $options: 'i' }
    //                     },
    //                     {
    //                         "business_info.gstin": { $regex: req.query.query, $options: 'i' }
    //                     },

    //                 ]
    //             }
    //         ]
    //     }
    // console.l.l.log(query + " Query")
    // }

    //Abhin New 
    if (req.query.query) {
        var filters = [];
        var specification = {};
        specification['$lookup'] = {
            from: "User",
            localField: "user",
            foreignField: "_id",
            as: "user",
        };
        filters.push(specification);

        var specification = {};
        specification['$unwind'] = {
            path: "$user",
            preserveNullAndEmptyArrays: false
        };
        filters.push(specification);

        var specification = {};
        specification['$lookup'] = {
            from: "Car",
            localField: "car",
            foreignField: "_id",
            as: "car",
        };
        filters.push(specification);

        var specification = {};
        specification['$lookup'] = {
            from: "User",
            localField: "advisor",
            foreignField: "_id",
            as: "advisor",
        };
        filters.push(specification);

        var specification = {};
        specification['$unwind'] = {
            path: "$advisor",
            preserveNullAndEmptyArrays: false
        };
        filters.push(specification);


        var page = 0;

        if (req.query.page == undefined) {
            page = 0;
        }
        else {
            page = req.query.page;
        }

        var page = Math.max(0, parseInt(page));

        // if (role.role == "Service Advisor") {
        //     var specification = {};
        //     specification['$match'] = {
        //         "advisor._id": mongoose.Types.ObjectId(role.user),

        //     }
        //     filters.push(specification);
        // }
        // //Abhinav New Role
        // else if (role.role == "cr_assignee") {
        //     var specification = {};
        //     specification['$match'] = {
        //         "cr_assignee._id": mongoose.Types.ObjectId(role.user),

        //     }
        //     filters.push(specification);
        // }
        // //END
        if (req.query.query) {
            req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        }
        var specification = {};
        specification['$match'] = {
            status: { $in: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] },
            is_services: true,
            "user.account_info.type": "user",
            // business: business,
            business: mongoose.Types.ObjectId(business),
            $or: [
                // { 'status': { $regex: req.query.query, $options: 'i' } },
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },
                // { 'car.title': { $regex: req.query.query, $options: 'i' } },
                // { 'car.registration_no': { $regex: req.query.query, $options: 'i' } },
                // { 'insurance_info.insurance_company': { $regex: req.query.query, $options: 'i' } },
                // {
                //     "logs": {
                //         $elemMatch: {
                //             "status": { $regex: req.query.query, $options: 'i' }
                //         }
                //     }
                // },
                // {
                //     "services": {
                //         $elemMatch: {
                //             "service": { $regex: req.query.query, $options: 'i' }
                //         }
                //     }
                // },
                // {
                //     "services": {
                //         $elemMatch: {
                //             "parts": {
                //                 $elemMatch: {
                //                     "item": { $regex: req.query.query, $options: 'i' },
                //                 }
                //             }
                //         }
                //     }
                // },
                // {
                //     "services": {
                //         $elemMatch: {
                //             "parts": {
                //                 $elemMatch: {
                //                     "part_no": { $regex: req.query.query, $options: 'i' },
                //                 }
                //             }
                //         }
                //     }
                // },
            ]
        };
        filters.push(specification);


        var specification = {};
        specification['$sort'] = {
            updated_at: -1,
        };
        filters.push(specification);
        // totalResult = await Booking.aggregate(filters)

        var specification = {};
        specification['$skip'] = config.perPage * page;
        filters.push(specification);

        var specification = {};
        specification['$limit'] = config.perPage;
        filters.push(specification);
        var query = {
            // status: { $in: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] },
            is_services: true,
            // "account_info.type": "user",
            business: business
        }
        // var totalResult = await Booking.find(query).count();
        // console.l.l.log("Total Resultsss  " + totalResult)
        let counter = 0;
        await Booking.aggregate(filters)
            .allowDiskUse(true)
            .cursor({ batchSize: 10 })
            .exec()
            .eachAsync(async function (booking) {
                counter += 1
                result.push({
                    _id: booking.user._id,
                    id: booking.user._id,
                    name: booking.user.name,
                    email: booking.user.email,
                    referral_code: booking.user.referral_code,
                    // referral_code: rating,
                    contact_no: booking.user.contact_no,
                    address: booking.user.address,
                    bank_details: booking.user.bank_details,
                    business_info: booking.user.business_info,
                    account_info: booking.user.account_info,
                    agent: booking.user.agent,
                    partner: booking.user.partner,
                    created_at: moment(booking.user.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(booking.user.created_at).tz(req.headers['tz']).format('ll'),
                })
            });
        await BusinessOrder.aggregate(filters)
            .allowDiskUse(true)
            .cursor({ batchSize: 10 })
            .exec()
            .eachAsync(async function (order) {
                if (order.user) {
                    counter += 1
                    result.push({
                        _id: order.user._id,
                        id: order.user._id,
                        name: order.user.name,
                        email: order.user.email,
                        referral_code: order.user.referral_code,
                        // referral_code: rating,
                        contact_no: order.user.contact_no,
                        address: order.user.address,
                        bank_details: order.user.bank_details,
                        business_info: order.user.business_info,
                        account_info: order.user.account_info,
                        agent: order.user.agent,
                        partner: order.user.partner,
                        created_at: moment(order.user.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(order.user.created_at).tz(req.headers['tz']).format('ll'),
                    })
                }
            });
        // console.l.l.log("Counterr = " + counter)
        result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
        counter = result.length
        res.status(200).json({
            responseCode: 200,
            responseInfo: {
                totalResult: counter
            },
            // responseQuery: query,
            responseMessage: "success",
            responseData: result
        });
    }
    else if (req.query.from && req.query.to) {

        // console.l.l.log(req.query.from + " Date filter " + req.query.to)
        var from = new Date(req.query.from);
        var to = new Date(req.query.to);
        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        // var duration = endDate.diff(startDate, 'days', true);
        // console.l.l.log(from + " Date filter Query " + new Date())
        var query = {
            // "account_info.type": "user",
            status: { $in: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] },
            is_services: true,
            // "account_info.type": "user",
            business: business,
            created_at: { $gte: from, $lte: to }
        }
        // console.l.l.log("-->>>>>>>>> " + query)
        var totalResult = await Booking.find(query).count();
        // console.l.l.log("Total Users = " + totalResult)
        await Booking.find(query)
            .populate('user')
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (p) => {
                // var rating = 0;
                // var psfRate = await Review.find({ user: p.user._id }).exec();
                // if (psfRate) {
                // console.l.l.log("All   " + psfRate + " -- " + p.user._id)
                //     rating = psfRate[0].rating
                // }
                // console.l.l.log("All   Points " + psfRate.rating)
                result.push({
                    _id: p.user._id,
                    id: p.user._id,
                    name: p.user.name,
                    email: p.user.email,
                    referral_code: p.user.referral_code,
                    // referral_code: rating,
                    contact_no: p.user.contact_no,
                    address: p.user.address,
                    bank_details: p.user.bank_details,
                    business_info: p.user.business_info,
                    account_info: p.user.account_info,
                    agent: p.user.agent,
                    partner: p.user.partner,
                    created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                })
            });
        result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));

        res.status(200).json({
            responseCode: 200,
            responseInfo: {
                totalResult: totalResult
            },
            responseQuery: query,
            responseMessage: "success",
            responseData: result
        });



    }
    else if (req.query.psf == "None") {

        // console.l.l.log(req.query.psf)
        var query = {
            // "account_info.type": "user",
            status: { $eq: "Completed", $ne: "Closed" },
            is_services: true,
            // "account_info.type": "user",
            business: business,
        }

        var totalResult = await Lead.find({ psf: false, "remark.status": "Closed", business: business }).count();
        // console.l.l.log("Total PSF False " + totalResult)

        // var totalResult = await Booking.find(query).count();
        // console.l.l.log("Total Users Not PSF = " + totalResult)
        // await Booking.find(query)      //FROM Booking

        await Lead.find({ psf: true, "remark.status": "PSF", business: business })
            .populate('user')
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (p) => {
                // var rating = 0;
                // var psfRate = await Review.find({ user: p.user._id }).exec();
                // if (psfRate) {
                // console.l.l.log("All   " + psfRate + " -- " + p.user._id)
                //     rating = psfRate[0].rating
                // }
                // console.l.l.log("All   Points " + psfRate.rating)
                result.push({
                    _id: p.user._id,
                    id: p.user._id,
                    name: p.user.name,
                    email: p.user.email,
                    referral_code: p.user.referral_code,
                    // referral_code: rating,
                    contact_no: p.user.contact_no,
                    address: p.user.address,
                    bank_details: p.user.bank_details,
                    business_info: p.user.business_info,
                    account_info: p.user.account_info,
                    agent: p.user.agent,
                    partner: p.user.partner,
                    created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                })
            });
        result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));

        res.status(200).json({
            responseCode: 200,
            responseInfo: {
                totalResult: totalResult
            },
            responseQuery: query,
            responseMessage: "success",
            responseData: result
        });



    }
    else if (req.query.psf && req.query.psf != "None") {
        var query = {
            rating: parseInt(req.query.psf),
            business: business
        }
        // console.l.l.log("PSF Ratings = " + parseInt(req.query.psf))
        var totalResult = await Review.find(query).count();
        // console.l.l.log("Total Resultsss  " + totalResult)
        await Review.find(query)
            .populate('user')
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (p) => {
                // var rating = 0;
                // var psfRate = await Review.find({ user: p.user._id }).exec();
                // if (psfRate) {
                // console.l.l.log("All   " + psfRate + " -- " + p.user._id)
                //     rating = psfRate[0].rating
                // }
                // console.l.l.log("All   Points " + psfRate.rating)

                if (p.user) {
                    var id = p.user._id
                    var name = p.user.name
                    var email = p.user.email
                    var email = p.user.email
                    var referral_code = p.user.referral_code
                    // referral_code: rating,
                    var contact_no = p.user.contact_no
                    var address = p.user.address
                    var bank_details = p.user.bank_details
                    var business_info = p.user.business_info
                    var account_info = p.user.account_info
                    var agent = p.user.agent
                    var partner = p.user.partner
                    var created_at = moment(p.created_at).tz(req.headers['tz']).format('ll')
                    var updated_at = moment(p.created_at).tz(req.headers['tz']).format('ll')
                }
                else {
                    var id = "N/A"
                    var name = "N/A"
                    var email = "N/A"
                    var referral_code = "N/A"
                    // referral_code: rating,
                    var contact_no = "N/A"
                    var address = "N/A"
                    var bank_details = "N/A"
                    var business_info = "N/A"
                    var account_info = "N/A"
                    var agent = "N/A"
                    var partner = "N/A"
                    var created_at = "N/A"
                    var updated_at = "N/A"
                }

                result.push({
                    _id: id,
                    id: id,
                    name: name,
                    email: email,
                    referral_code: referral_code,
                    // referral_code: rating,
                    contact_no: contact_no,
                    address: address,
                    bank_details: bank_details,
                    business_info: business_info,
                    account_info: account_info,
                    agent: agent,
                    partner: partner,
                    created_at: created_at,
                    updated_at: updated_at,
                })
            });
        // async function removeDublicateDoumnets(originalArray, prop) {
        //     var newArray = [];
        //     var lookupObject = {};

        //     for (var i in originalArray) {
        //         lookupObject[originalArray[i][prop]] = originalArray[i];
        //     }

        //     for (i in lookupObject) {
        //         newArray.push(lookupObject[i]);
        //     }

        //     return newArray;
        // }

        result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));

        res.status(200).json({
            responseCode: 200,
            responseInfo: {
                totalResult: totalResult
            },
            responseQuery: query,
            responseMessage: "success",
            responseData: result
        });
    }
    else if (req.query.package) {
        var query = {
            package: req.query.package,
            business: business
        }

        var totalResult = await UserPackage.find(query).count();
        // console.l.l.log("Total Resultsss  " + totalResult)
        await UserPackage.find(query)
            .populate('user')
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (p) => {
                // var rating = 0;
                // var psfRate = await Review.find({ user: p.user._id }).exec();
                // if (psfRate) {
                // console.l.l.log("All   " + psfRate + " -- " + p.user._id)
                //     rating = psfRate[0].rating
                // }
                // console.l.l.log("All   Points " + psfRate.rating)

                if (p.user) {
                    var id = p.user._id
                    var name = p.user.name
                    var email = p.user.email
                    var email = p.user.email
                    var referral_code = p.user.referral_code
                    // referral_code: rating,
                    var contact_no = p.user.contact_no
                    var address = p.user.address
                    var bank_details = p.user.bank_details
                    var business_info = p.user.business_info
                    var account_info = p.user.account_info
                    var agent = p.user.agent
                    var partner = p.user.partner
                    var created_at = moment(p.created_at).tz(req.headers['tz']).format('ll')
                    var updated_at = moment(p.created_at).tz(req.headers['tz']).format('ll')
                }
                else {
                    var id = "N/A"
                    var name = "N/A"
                    var email = "N/A"
                    var referral_code = "N/A"
                    // referral_code: rating,
                    var contact_no = "N/A"
                    var address = "N/A"
                    var bank_details = "N/A"
                    var business_info = "N/A"
                    var account_info = "N/A"
                    var agent = "N/A"
                    var partner = "N/A"
                    var created_at = "N/A"
                    var updated_at = "N/A"
                }

                result.push({
                    _id: id,
                    id: id,
                    name: name,
                    email: email,
                    referral_code: referral_code,
                    // referral_code: rating,
                    contact_no: contact_no,
                    address: address,
                    bank_details: bank_details,
                    business_info: business_info,
                    account_info: account_info,
                    agent: agent,
                    partner: partner,
                    created_at: created_at,
                    updated_at: updated_at,
                })
            });
        result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));

        res.status(200).json({
            responseCode: 200,
            responseInfo: {
                totalResult: totalResult
            },
            responseQuery: query,
            responseMessage: "success",
            responseData: result
        });
    }
    else {
        var query = {
            // status: { $in: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] },
            is_services: true,
            // "account_info.type": "user",
            business: business
        }

        var totalResult = await Booking.find(query).count();
        // console.l.log("Total Users = " + totalResult)
        await Booking.find(query)
            .populate('user')
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (p) => {

                var data = {
                    _id: p.user._id,
                    id: p.user._id,
                    name: p.user.name,
                    email: p.user.email,
                    referral_code: p.user.referral_code,
                    // referral_code: rating,
                    contact_no: p.user.contact_no,
                    address: p.user.address,
                    bank_details: p.user.bank_details,
                    business_info: p.user.business_info,
                    account_info: p.user.account_info,
                    agent: p.user.agent,
                    partner: p.user.partner,
                    created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                }

                // if (result.includes(data) === false) {
                //     result.push(data);
                // }
                result.push(data)
            });
        await BusinessOrder.find({ business: business })
            .populate('user')
            .sort({ updated_at: -1 })
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (p) => {
                if (p.user) {
                    var data = {
                        _id: p.user._id,
                        id: p.user._id,
                        name: p.user.name,
                        email: p.user.email,
                        referral_code: p.user.referral_code,
                        // referral_code: rating,
                        contact_no: p.user.contact_no,
                        address: p.user.address,
                        bank_details: p.user.bank_details,
                        business_info: p.user.business_info,
                        account_info: p.user.account_info,
                        agent: p.user.agent,
                        partner: p.user.partner,
                        created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                    }
                    result.push(data)
                }
                // if (result.includes(data) === false) {
                //     result.push(data);
                // }

            });


        var orderCustomer = await BusinessOrder.find({ business: business }).count().exec();
        // console.l.log("Count " + orderCustomer)
        totalResult = totalResult + orderCustomer
        result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
        res.status(200).json({
            responseCode: 200,
            responseInfo: {
                totalResult: totalResult,

            },
            responseQuery: query,
            responseMessage: "success",
            responseData: result
        });
    }

});

router.get('/user/package/list/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    // console.l.l.log("Business Id = " + business)
    var pack = await Package.find({ business: business }).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: pack
    });
});

router.get('/offer/list', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /offer/list Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var data = [];
    var business = req.headers['business'];;
    var status = '';
    var count = 0;
    var activeCounts = 0
    var inActiveCounts = 0
    var expiredCounts = 0
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching all Offer list for the user, User:" + loggedInDetails.name);
    }
    await BusinessOffer.find({ business: business })
        .sort({ created_at: -1 })
        .cursor().eachAsync(async (offer) => {
            if (offer) {
                var serverTime = moment.tz(new Date(), req.headers['tz']);
                var bar = moment.tz(new Date(offer.valid_till), req.headers['tz']);
                var baz = bar.diff(serverTime);
                // console.l.l.log(baz);

                // if (baz > 0) {
                if (offer.publish == true && baz > 0) {
                    status = "Active";
                    activeCounts = activeCounts + 1
                } else if (offer.publish == false && baz > 0) {
                    status = "InActive";
                    inActiveCounts = inActiveCounts + 1
                }
                else {
                    status = "Expired";
                    expiredCounts = expiredCounts + 1
                }
                count += 1;


                data.push({
                    name: offer.name,
                    _id: offer._id,
                    description: offer.description,
                    code: offer.code,
                    limit: offer.limit,
                    category: offer.category,
                    discount: offer.discount,
                    terms: offer.terms,
                    start_date: offer.start_date,
                    // start_date1: new Date(offer.start_date),
                    valid_till: offer.valid_till,

                    featured: offer.featured,
                    publish: offer.publish,
                    validity: parseInt(offer.validity),
                    status: status,
                    discount: offer.discount,
                    image: "https://s3.ap-south-1.amazonaws.com/careager/offer/" + offer.image
                });

                // }

            }
        })
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Offer List of the user in Response, User:" + loggedInDetails.name);
    }

    // console.l.l.log(count)
    res.status(200).json({
        responseCode: 200,
        responseMessage: {
            total: count,
            activeCounts: activeCounts,
            inActiveCounts: inActiveCounts,
            expiredCounts: expiredCounts,
        }
        ,
        responseData: data
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Offer List of User Send in Response Successfully, User:" + loggedInDetails.name);
    }

});

router.get('/postals/get', async function (req, res, next) {
    businessFunctions.logs("INFO: /postals/get api called from user.js.")
    var rules = {
        zip: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        businessFunctions.logs("ERROR:validation failed,zip is required")
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Error",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        // console.l.time('looper')
        /*var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;*/
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

        // console.l.timeEnd('looper')

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        })
    }
});

router.post('/booking/convenience/add', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var data = [];

    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {
            var body = req.body;
            if (body.length > 0) {
                for (var i = 0; i < body.length; i++) {
                    var businessConvenience = await BusinessConvenience.findOne({ business: business, convenience: body[i].convenience }).exec();
                    if (businessConvenience) {
                        var data = {
                            charges: body[i].charges,
                            updated_at: new Date()
                        }

                        BusinessConvenience.findOneAndUpdate({ _id: businessConvenience._id }, { $set: data }, { new: false }, async function (err, doc) {
                            if (err) {
                                return res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                        });
                    }
                    else {
                        var data = {
                            business: business,
                            convenience: body[i].convenience,
                            charges: body[i].charges,
                            created_at: new Date(),
                            updated_at: new Date()
                        }


                        BusinessConvenience.create(data)
                            .then(async function (e) {
                            });
                    }
                }

                var businessConvenience = await BusinessConvenience.find({ business: business }).exec();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Conveniences",
                    responseData: businessConvenience
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Convenience Required",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
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

/*Abhinav Work START For Party Statements */
//AUTH //signup
//USER //OwnerAdd
router.post('/party/business/registration', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    req.body['whatsAppChannelId'] = '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2';
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();

    var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "business" }).count().exec();
    // console.l.l.log("req.body.contact_no= ", req.body.contact_no)
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
        // console.l.l.log("category: req.body.category,", req.body.category)
        // console.l.l.log("company_name", req.body.name)
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

        await User.create(req.body).then(async function (user) {
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

            await Management.create({
                business: user._id,
                user: user._id,
                role: "Admin",
                created_at: new Date(),
                updated_at: new Date(),
            });

            await Address.create({
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
            await BusinessSetting.create({
                discount_on: "Labour",
                business: user._id,
                job_inspection_pics_limit: 11,
                qc_inspection_limit: 11,
                skip_insurance_info: true,
                skip_store_approval: true,
                skip_qc: true,
                tax_invoice: true,
                gst_invoice: true,
            });
            // console.l.l.log("------"+user._id);
            if (req.body.planCategory != "others") {
                var freePlan = await SuitePlan.findOne({ plan: "Free", category: req.body.planCategory }).exec();

                if (freePlan) {
                    var plans = await BusinessPlan.find({ business: user._id, suite: freePlan.id }).count().exec();
                    if (plans == 0) {
                        // console.l.log("Inside Plan = " + freePlan.id)
                        await SuitePlan.find({ _id: freePlan.id })
                            .cursor().eachAsync(async (plan) => {
                                if (plan) {
                                    var plan_no = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 10);
                                    var expired_at = new Date();
                                    var status = "Success"
                                    expired_at.setDate(expired_at.getDate() + plan.validity);
                                    await BusinessPlan.create({
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
                                        "payment.mode": "Free",
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
                                    await TransactionLog.create({
                                        user: user._id,
                                        activity: "Business-Plan",
                                        status: "Purchase",
                                        received_by: "Self Registered",
                                        source: user._id,
                                        plan_no: plan_no,
                                        business: user._id,
                                        paid_by: "Customer",
                                        paid_total: plan.price,
                                        total: plan.price,

                                        payment_mode: "Free Account",
                                        payment_status: "Success",
                                        order_id: null,
                                        transaction_id: "free Account",
                                        transaction_date: new Date(),
                                        transaction_status: "Success",
                                        transaction_response: "Success",
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                    })
                                }
                            });
                        // console.l.log("Suite plans has been added.")
                    } else {
                        // console.l.log("Some Plans already active.")
                    }
                }
            }
            // event.autroidReg(req.body.city, req.body.category, user._id);
            // await whatsAppEvent.autroidBusinessReg(user.name, user.contact_no);

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


//This API Will Fetch All user from USER table. 
//Any business can see all Users
router.get('/parties/get', xAccessToken.token, async function (req, res, next) {

    // console.l.log("Api Called")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var loggedInUser = await User.findById(decoded.user).exec();
    var product = new Object();
    var result = [];
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.limit == undefined) {
        var limit = 20;
    } else {
        var limit = parseInt(req.query.limit);
    }

    var list = []
    var type = req.query.type;
    // let startDate = req.query.from
    // let endDate = req.query.to
    // let brand = req.query.brand
    // console.l.l.log(startDate, req.query.end_date)

    // if (req.query.type == "business") {
    if (req.query.query) {

        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        // console.l.l.log("Query=  " + req.query.query)
        var query = {
            $and: [
                {
                    // "account_info.type": "business",
                    // "visibility": true,
                    _id: { $ne: mongoose.Types.ObjectId(business) },
                    "account_info.type": { $in: ["business", 'user'] },
                    "account_info.status": { $in: ["Complete", 'Active'] },
                    $or: [
                        {
                            "name": { $regex: req.query.query, $options: 'i' }
                        },
                        {
                            "contact_no": { $regex: req.query.query, $options: 'i' }
                        },
                        {
                            "business_info.gstin": { $regex: req.query.query, $options: 'i' }
                        },
                        {
                            "business_info.company_name": { $regex: req.query.query, $options: 'i' }
                        },
                    ]
                }
            ]
        }
        // console.l.log(query + " Query")
    }
    else {

        // console.l.l.log("Else 1216 ")
        var query = {
            // "account_info.type": "business",
            // "visibility": true,
            // Active,
            // Complete,
            // Deleted,
            // Inactive,
            // Terminate,
            // deleted
            _id: { $ne: mongoose.Types.ObjectId(business) },
            "account_info.type": { $in: ["business", 'user'] },
            "account_info.status": { $in: ["Complete", 'Active'] },

        }
    }
    // }
    // else {
    //     if (req.query.query) {
    // console.l.l.l.log("Query = " + req.query.query)
    //         var query = {
    //             $and: [
    //                 {
    //                     "account_info.type": "user",
    //                     $or: [
    //                         {
    //                             "name": { $regex: req.query.query, $options: 'i' }
    //                         },
    //                         {
    //                             "contact_no": { $regex: req.query.query, $options: 'i' }
    //                         },

    //                     ]
    //                 }
    //             ]
    //         }
    // console.l.l.l.log(query + " Query")
    //     }
    //     else {
    //         var query = {
    //             "account_info.type": "user"
    //         }
    //     }
    // }


    var totalResult = await User.find(query).count();
    // console.l.log("Total Result  = " + totalResult)

    await User.find(query)
        .skip(limit * page).limit(limit)
        .sort({ created_at: -1 })
        .cursor().eachAsync(async (user) => {
            var statementData = {};

            var details = await q.all(businessFunctions.getStatementDetails({ user: user._id, business: business }));
            if (details) {
                // console.l.log("Data = " + JSON.stringify(details));
                statementData = {
                    // party: party,
                    totalSale: details.totalSale - details.totalSaleCancelled,
                    totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                    totalPaymentIn: details.totalPaymentIn,
                    totalPaymentOut: details.totalPaymentOut,
                    totalPurchaseCancelled: details.totalPurchaseCancelled,
                    totalSaleCancelled: details.totalPurchaseCancelled,
                    balance: details.balance,
                    lastTransaction: details.lastTransaction
                }

            }

            result.push({
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                business: business,
                statement: statementData,
                // referral_code: user.referral_code,
                contact_no: user.contact_no,
                business_info: user.business_info,
                account_info: user.account_info,
                // type: user.account_info.type,
                // address: user.address,
                // bank_details: user.bank_details,

                // agent: user.agent,
                // partner: user.partner,
                // plans_details: busi,
                created_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
            })
        });

    // result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
    res.status(200).json({
        responseCode: 200,
        responseInfo: {
            totalResult: totalResult
        },
        // responseQuery: query,
        responseMessage: "success",
        responseData: result
    });


})
router.get('/parties/get/allBusiness', xAccessToken.token, async function (req, res, next) {
    // console.l.log("API ")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    // console.l.l.log("Called............")
    // console.l.l.l.log("Business Id = " + business)


    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.limit == undefined) {
        var limit = 30;
    } else {
        var limit = parseInt(req.query.limit);
    }

    var list = []





    //Abhin New 
    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        var filters = [];
        var specification = {};
        specification['$lookup'] = {
            from: "User",
            localField: "user",
            foreignField: "_id",
            as: "user",
        };
        filters.push(specification);

        var specification = {};
        specification['$unwind'] = {
            path: "$user",
            preserveNullAndEmptyArrays: false
        };
        filters.push(specification);

        var specification = {};
        specification['$lookup'] = {
            from: "Car",
            localField: "car",
            foreignField: "_id",
            as: "car",
        };
        filters.push(specification);

        var specification = {};
        specification['$lookup'] = {
            from: "User",
            localField: "advisor",
            foreignField: "_id",
            as: "advisor",
        };
        filters.push(specification);

        var specification = {};
        specification['$unwind'] = {
            path: "$advisor",
            preserveNullAndEmptyArrays: false
        };
        filters.push(specification);


        var page = 0;

        if (req.query.page == undefined) {
            page = 0;
        }
        else {
            page = req.query.page;
        }

        var page = Math.max(0, parseInt(page));

        var specification = {};
        specification['$match'] = {
            status: { $in: ["Completed", "CompleteWork", "QC", "Closed", "Pending", "Ready", "Rejected", "Cancelled", "Inactive"] },
            is_services: true,
            "user.account_info.type": "user",
            // business: business,
            business: mongoose.Types.ObjectId(business),
            $or: [
                // { 'status': { $regex: req.query.query, $options: 'i' } },
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },

            ]
        };
        filters.push(specification);


        var specification = {};
        specification['$sort'] = {
            updated_at: -1,
        };
        filters.push(specification);
        // totalResult = await Booking.aggregate(filters)

        var specification = {};
        specification['$skip'] = config.perPage * page;
        filters.push(specification);

        var specification = {};
        specification['$limit'] = config.perPage;
        filters.push(specification);
        var query = {
            // status: { $in: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] },
            is_services: true,
            // "account_info.type": "user",
            business: business
        }
        // var totalResult = await Booking.find(query).count();
        // console.l.l.log("Total Resultsss  " + totalResult)
        let counter = 0;
        await Booking.aggregate(filters)
            .allowDiskUse(true)
            .cursor({ batchSize: 10 })
            .exec()
            .eachAsync(async function (booking) {
                counter += 1
                var user = booking.user
                var statementData = {};

                var details = await q.all(businessFunctions.getStatementDetails({ user: user._id, business: business }));
                if (details) {
                    // console.l.log("Data = " + JSON.stringify(details));
                    statementData = {
                        // party: party,
                        totalSale: details.totalSale - details.totalSaleCancelled,
                        totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                        totalPaymentIn: details.totalPaymentIn,
                        totalPaymentOut: details.totalPaymentOut,
                        totalPurchaseCancelled: details.totalPurchaseCancelled,
                        totalSaleCancelled: details.totalPurchaseCancelled,
                        balance: details.balance,
                        lastTransaction: details.lastTransaction
                    }
                }

                result.push({
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    business: business,
                    statement: statementData,
                    // referral_code: user.referral_code,
                    contact_no: user.contact_no,
                    business_info: user.business_info,
                    account_info: user.account_info,
                    // type: user.account_info.type,
                    // address: user.address,
                    // bank_details: user.bank_details,

                    // agent: user.agent,
                    // partner: user.partner,
                    // plans_details: busi,
                    created_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                })
            });


        var filter2 = [];
        var specification = {};
        specification['$lookup'] = {
            from: "User",
            localField: "user",
            foreignField: "_id",
            as: "user",
        };
        filter2.push(specification);

        var specification = {};
        specification['$unwind'] = {
            path: "$user",
            preserveNullAndEmptyArrays: false
        };
        filter2.push(specification);
        var specification = {};
        specification['$sort'] = {
            updated_at: -1,
        };
        filter2.push(specification);
        // totalResult = await Booking.aggregate(filters)

        var specification = {};
        specification['$skip'] = config.perPage * page;
        filter2.push(specification);

        var specification = {};
        specification['$limit'] = config.perPage;
        filter2.push(specification);

        var specification = {};
        specification['$match'] = {
            // business: business,
            business: mongoose.Types.ObjectId(business),
            $or: [
                // { 'status': { $regex: req.query.query, $options: 'i' } },
                { 'user.name': { $regex: req.query.query, $options: 'i' } },
                { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },

            ]
        };
        filter2.push(specification);

        await BusinessOrder.aggregate(filter2)
            .allowDiskUse(true)
            .cursor({ batchSize: 10 })
            .exec()
            .eachAsync(async function (order) {
                if (order.user) {
                    counter += 1
                    var user = order.user
                    var statementData = {};
                    // console.l.log("Order Users = ")
                    var details = await q.all(businessFunctions.getStatementDetails({ user: user._id, business: business }));
                    if (details) {
                        // console.l.l.log("Data = " + JSON.stringify(details));
                        statementData = {
                            // party: party,
                            totalSale: details.totalSale - details.totalSaleCancelled,
                            totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                            totalPaymentIn: details.totalPaymentIn,
                            totalPaymentOut: details.totalPaymentOut,
                            totalPurchaseCancelled: details.totalPurchaseCancelled,
                            totalSaleCancelled: details.totalPurchaseCancelled,
                            balance: details.balance,
                            lastTransaction: details.lastTransaction
                        }
                    }

                    result.push({
                        _id: user._id,
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        business: business,
                        statement: statementData,
                        // referral_code: user.referral_code,
                        contact_no: user.contact_no,
                        business_info: user.business_info,
                        account_info: user.account_info,
                        // type: user.account_info.type,
                        // address: user.address,
                        // bank_details: user.bank_details,

                        // agent: user.agent,
                        // partner: user.partner,
                        // plans_details: busi,
                        created_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    })

                }
            });

        var Userquery = {
            $and: [
                {
                    "account_info.type": "business",
                    "visibility": true,
                    _id: { $ne: mongoose.Types.ObjectId(business) },
                    $or: [
                        {
                            "name": { $regex: req.query.query, $options: 'i' }
                        },
                        {
                            "contact_no": { $regex: req.query.query, $options: 'i' }
                        },
                    ]
                }
            ]
        }
        await User.find(Userquery)
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (user) => {
                counter += 1
                var statementData = {};

                var details = await q.all(businessFunctions.getStatementDetails({ user: user._id, business: business }));
                if (details) {
                    // console.l.log("Data = " + JSON.stringify(details));
                    statementData = {
                        // party: party,
                        totalSale: details.totalSale - details.totalSaleCancelled,
                        totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                        totalPaymentIn: details.totalPaymentIn,
                        totalPaymentOut: details.totalPaymentOut,
                        totalPurchaseCancelled: details.totalPurchaseCancelled,
                        totalSaleCancelled: details.totalPurchaseCancelled,
                        balance: details.balance,
                        lastTransaction: details.lastTransaction
                    }
                }

                result.push({
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    business: business,
                    statement: statementData,
                    // referral_code: user.referral_code,
                    contact_no: user.contact_no,
                    business_info: user.business_info,
                    account_info: user.account_info,
                    // type: user.account_info.type,
                    // address: user.address,
                    // bank_details: user.bank_details,

                    // agent: user.agent,
                    // partner: user.partner,
                    // plans_details: busi,
                    created_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                })
            });
        // console.l.l.log("Counterr = " + counter)
        result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
        counter = result.length
        res.status(200).json({
            responseCode: 200,
            responseInfo: {
                totalResult: counter
            },
            // responseQuery: query,
            responseMessage: "success",
            responseData: result
        });
    }

    else {
        var query = {
            // status: { $in: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] },
            is_services: true,
            // "account_info.type": "user",
            business: business
        }

        var totalResult = await Booking.find(query).count();
        // console.l.log("Total Users = " + totalResult)
        await Booking.find(query)
            .populate('user')
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (booking) => {

                var user = booking.user
                var statementData = {};

                var details = await q.all(businessFunctions.getStatementDetails({ user: user._id, business: business }));
                if (details) {
                    // console.l.log("Data = " + JSON.stringify(details));
                    statementData = {
                        // party: party,
                        totalSale: details.totalSale - details.totalSaleCancelled,
                        totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                        totalPaymentIn: details.totalPaymentIn,
                        totalPaymentOut: details.totalPaymentOut,
                        totalPurchaseCancelled: details.totalPurchaseCancelled,
                        totalSaleCancelled: details.totalPurchaseCancelled,
                        balance: details.balance,
                        lastTransaction: details.lastTransaction
                    }
                }

                result.push({
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    business: business,
                    statement: statementData,
                    // referral_code: user.referral_code,
                    contact_no: user.contact_no,
                    business_info: user.business_info,
                    account_info: user.account_info,
                    // type: user.account_info.type,
                    // address: user.address,
                    // bank_details: user.bank_details,

                    // agent: user.agent,
                    // partner: user.partner,
                    // plans_details: busi,
                    created_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                })
            });
        await BusinessOrder.find({ business: business })
            .populate('user')
            .sort({ updated_at: -1 })
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (p) => {
                if (p.user) {
                    var user = p.user
                    var statementData = {};

                    var details = await q.all(businessFunctions.getStatementDetails({ user: user._id, business: business }));
                    if (details) {
                        // console.l.log("Data = " + JSON.stringify(details));
                        statementData = {
                            // party: party,
                            totalSale: details.totalSale - details.totalSaleCancelled,
                            totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                            totalPaymentIn: details.totalPaymentIn,
                            totalPaymentOut: details.totalPaymentOut,
                            totalPurchaseCancelled: details.totalPurchaseCancelled,
                            totalSaleCancelled: details.totalPurchaseCancelled,
                            balance: details.balance,
                            lastTransaction: details.lastTransaction
                        }
                    }

                    result.push({
                        _id: user._id,
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        business: business,
                        statement: statementData,
                        // referral_code: user.referral_code,
                        contact_no: user.contact_no,
                        business_info: user.business_info,
                        account_info: user.account_info,
                        // type: user.account_info.type,
                        // address: user.address,
                        // bank_details: user.bank_details,

                        // agent: user.agent,
                        // partner: user.partner,
                        // plans_details: busi,
                        created_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    })
                }
                // if (result.includes(data) === false) {
                //     result.push(data);
                // }

            });

        await User.find({
            "account_info.type": "business",
            "visibility": true,
        })
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (user) => {

                var statementData = {};

                var details = await q.all(businessFunctions.getStatementDetails({ user: user._id, business: business }));
                if (details) {
                    // console.l.log("Data = " + JSON.stringify(details));
                    statementData = {
                        // party: party,
                        totalSale: details.totalSale - details.totalSaleCancelled,
                        totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                        totalPaymentIn: details.totalPaymentIn,
                        totalPaymentOut: details.totalPaymentOut,
                        totalPurchaseCancelled: details.totalPurchaseCancelled,
                        totalSaleCancelled: details.totalPurchaseCancelled,
                        balance: details.balance,
                        lastTransaction: details.lastTransaction
                    }
                }

                result.push({
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    business: business,
                    statement: statementData,
                    // referral_code: user.referral_code,
                    contact_no: user.contact_no,
                    business_info: user.business_info,
                    account_info: user.account_info,
                    // type: user.account_info.type,
                    // address: user.address,
                    // bank_details: user.bank_details,

                    // agent: user.agent,
                    // partner: user.partner,
                    // plans_details: busi,
                    created_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                })
            });

        var orderCustomer = await BusinessOrder.find({ business: business }).count().exec();
        var otherBusieness = await User.find({
            "account_info.type": "business",
            "visibility": true,
        }).count().exec();
        // console.l.log("Count " + orderCustomer)
        totalResult = totalResult + orderCustomer + otherBusieness
        result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
        res.status(200).json({
            responseCode: 200,
            responseInfo: {
                totalResult: totalResult,

            },
            responseQuery: query,
            responseMessage: "success",
            responseData: result
        });
    }

});
router.get('/party/statements/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /party/statements/get Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    // console.l.log("Api Called")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();
    var product = new Object();
    var result = [];
    var duration = {}

    // let startDate = req.query.from
    // let endDate = req.query.to
    // let brand = req.query.brand

    // console.l.log("Total Result  = " + totalResult)
    var transactions = [];
    if (req.query.date) {
        var date = new Date();
        //from 10-05-21to13-07-21
        if (req.query.dateType == "range") {
            var query = req.query.date;
            var ret = query.split("to");
            var from = new Date(ret[0]);
            var to = new Date(ret[1]);
        }

        // 70 Days
        else if (req.query.dateType == "period") {
            if (parseInt(req.query.date) > 1) {
                var days = parseInt(req.query.date);
                var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
                var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            } else if (parseInt(req.query.date) == 0) {
                var query = parseInt(req.query.date);
                var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }
            else if (parseInt(req.query.date) == 1) {
                var query = parseInt(req.query.date);
                var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
                var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            }
        }
        else {
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }


        // console.log("From = " + from + " TO " + to)
        var duration = {
            from: from,
            to: to
        };

        query = {
            user: req.query.user, payment_status: { $ne: "Failure" }, business: business, transaction_date: { $gte: from, $lte: to }
        }
        var totalResult = await Statements.find(query).count();
        await Statements.find(query)
            .populate({ path: 'user', select: 'name contact_no' })
            .populate({ path: 'business', select: 'name contact_no' })
            .cursor().eachAsync(async (statements) => {
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Fatching Statements Details, From Date:" + from + "-" + "To:" + to + ", " + "Party Name:" + statements.user.name + ", " + "User:" + user.name);
                }
                transactions.push({
                    user: statements.user,
                    business: statements.business,
                    status: statements.status,
                    type: statements.type,
                    paid_by: statements.paid_by,
                    activity: statements.activity,
                    source: statements.source,
                    bill_id: statements.bill_id,
                    bill_amount: statements.bill_amount,
                    transaction_amount: statements.transaction_amount,
                    balance: statements.balance,
                    total: statements.total,
                    paid_total: statements.paid_total,
                    // due: parseFloat(statements.bill_amount) - parseFloat(statements.paid_total),
                    payment_status: statements.payment_status,
                    payment_mode: statements.payment_mode,
                    received_by: statements.received_by,
                    transaction_id: statements.transaction_id,
                    transaction_date: statements.transaction_date,
                    transaction_status: statements.transaction_status,
                    transaction_response: statements.transaction_response,
                    // transaction_type: statements.transaction_type,
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Statements Details Fatched Successfully, " + "Party Name:" + statements.user.name + ", " + "User:" + user.name);
                }
            });
    } else {
        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));

        if (req.query.limit == undefined) {
            var limit = 20;
        } else {
            var limit = parseInt(req.query.limit);
        }

        var list = []
        var query = {
            user: req.query.user, payment_status: { $ne: "Failure" }, business: business
        }

        var totalResult = await Statements.find(query).count();

        await Statements.find(query)
            .populate({ path: 'user', select: 'name contact_no' })
            .populate({ path: 'business', select: 'name contact_no' })
            .skip(limit * page).limit(limit)
            .sort({ created_at: 1 })
            .cursor().eachAsync(async (statements) => {
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Fatching Statements Details, From Date:" + from + "-" + "To:" + to + ", " + "Party Name:" + statements.user.name + ", " + "User:" + user.name);
                }
                transactions.push({
                    user: statements.user,
                    business: statements.business,
                    status: statements.status,
                    type: statements.type,
                    paid_by: statements.paid_by,
                    activity: statements.activity,
                    source: statements.source,
                    bill_id: statements.bill_id,
                    bill_amount: statements.bill_amount,
                    transaction_amount: statements.transaction_amount,
                    balance: statements.balance,
                    total: statements.total,
                    paid_total: statements.paid_total,
                    // due: parseFloat(statements.bill_amount) - parseFloat(statements.paid_total),
                    payment_status: statements.payment_status,
                    payment_mode: statements.payment_mode,
                    received_by: statements.received_by,
                    transaction_id: statements.transaction_id,
                    transaction_date: statements.transaction_date,
                    transaction_status: statements.transaction_status,
                    transaction_response: statements.transaction_response,
                    // transaction_type: statements.transaction_type,
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Statements Details Fatched Successfully, From Date:" + from + "-" + "To:" + to + ", " + "Party Name:" + statements.user.name + ", " + "User:" + user.name);
                }
            });


        //     var user =req.query.user;
        //    await event.partyStatement(user);
        //     // console.log("sadsfdsfd---------------------"+user);


    }
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Statements Details in Response" + ", " + "User:" + user.name);
    }
    // result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
    res.status(200).json({
        responseCode: 200,
        responseInfo: {
            totalResult: totalResult,
            duration: duration
        },
        responseQuery: query,
        responseMessage: "success",
        responseData: transactions
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Statements Details Send in Response Successfully, " + ", " + "User:" + user.name);
    }

})
//Testing For Party Statements
router.post('/test/transaction/story', async function (req, res, next) {
    var referrals = [];
    var total = 0, used = 0;

    var data = {
        user: req.body.user,
        business: req.body.business,
        status: req.body.status,
        type: req.body.type,
        paid_by: '',
        activity: req.body.activity,
        source: req.body.source,
        bill_id: req.body.bill_id,
        bill_amount: parseFloat(req.body.bill_amount),
        transaction_amount: parseFloat(req.body.transaction_amount),
        balance: 0,
        total: parseFloat(req.body.bill_amount),
        paid_total: 0,
        due: 0,
        payment_status: "Pending",
        payment_mode: 'N/A',
        received_by: 'Abhinav Tyagi',
        transaction_id: 'N/A',
        transaction_date: new Date(),
        transaction_status: 'Success',
        transaction_response: '',
        transaction_type: "Sale",
    }
    var valid = q.all(businessFunctions.addTransaction(data));
    // console.l.log("valid = " + valid)
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: data
    });
});
router.post('/record/party/payment', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /record/party/payment Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var rules = {
        user: 'required',
        amount: 'required',
        type: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, user,amount,type are required.");
        }
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
        var referrals = [];
        var total = 0, used = 0;
        var loggedInDetails = await User.findById(user).exec();

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated Successfully and fatching user details to make payment," + " " + "UserId:" + req.body.user + ", " + "User:" + loggedInDetails.name);
        }
        var party = await User.findById(req.body.user).exec();
        if (party) {
            var data = {
                user: req.body.user,
                business: business,
                status: req.body.type,
                type: req.body.type,
                paid_by: req.body.paid_by,
                activity: req.body.type,
                source: req.body.user,
                bill_id: 'N/A',
                bill_amount: parseFloat(req.body.amount),
                transaction_amount: parseFloat(req.body.amount),
                balance: parseFloat(req.body.amount),
                total: parseFloat(req.body.amount),
                paid_total: 0,
                due: 0,
                payment_status: "Success",
                payment_mode: req.body.payment_mode,
                received_by: loggedInDetails.name,
                transaction_id: req.body.transaction_id,
                transaction_date: new Date(req.body.transaction_date),
                transaction_status: 'Success',
                transaction_response: 'Success',
                transaction_type: req.body.type,
                remark: req.body.remark
            }
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: businessFunctions.addTransaction(data) function called to process Payment, User:" + loggedInDetails.name);
            }
            var valid = q.all(businessFunctions.addTransaction(data));


            // console.l.l.log("valid = " + JSON.stringfy(valid))
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Payment Processed Successfully and response send successfully, Party Name:" + req.body.name + ", " + "Amount:" + req.body.amount + ", " + "User:" + loggedInDetails.name);
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: data
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Payment Successfull, Activity:" + req.body.type + "Party Name:" + req.body.name + ", " + "Amount:" + req.body.amount + ", " + "Received By:" + loggedInDetails.name);
            }
        } else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: No Party Details found with the given user, UserId:" + req.body.user + ", " + "User:" + loggedInDetails.name);
            }
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Party not Found",
                responseData: data
            });
        }
    }
});

router.get('/party/statement/details', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /party/statement/details Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    // console.l.log("Api Called")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var party = await User.findById(req.query.user).exec();
    if (party) {
        var query = {
            user: party._id,
            business: business
        }
        var businessDetails = await User.findById(business).exec();


        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: businessFunctions.getStatementDetails(query) function called to get transactions details," + " " + "Party Name:" + party.name);
        }
        var details = await q.all(businessFunctions.getStatementDetails(query));

        if (details) {
            var data = {
                party: party,
                totalSale: details.totalSale - details.totalSaleCancelled,
                totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                totalPaymentIn: details.totalPaymentIn,
                totalPaymentOut: details.totalPaymentOut,
                totalPurchaseCancelled: details.totalPurchaseCancelled,
                totalSaleCancelled: details.totalPurchaseCancelled,
                balance: details.balance,
                business: businessDetails,
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Success",
                responseData: data
            });
        } else {
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: No Transaction Found," + " " + "Party Name:" + party.name);
            }
            res.status(422).json({
                responseCode: 422,
                responseMessage: "transactions not Found",
                responseData: {}
            });
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Party not found with the UserId:" + req.query.user);
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Party not Found",
            responseData: {}
        });
    }



});
//Get Payment IN - OUT using Aggregation
router.get('/payment/In-Out/list/get/old', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /payment/In-Out/list/get Api Called from user.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    // console.l.log("Api Called")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();

    if (req.query.page) {
        var page = req.query.page;
    }
    else {
        var page = 0
    }
    var page = Math.max(0, parseInt(page));

    var filters = [];
    if (req.query.type == 'Payment-In' || req.query.type == 'Payment-Out') {
        var specification = {};
        specification['type'] = req.query.type;
        specification['business'] = mongoose.Types.ObjectId(business);
        filters.push(specification);

        // var specification = {};
        // specification['$lookup'] = {
        //     from: "User",
        //     localField: "user",
        //     foreignField: "_id",
        //     as: "user",
        // };
        // filters.push(specification);

        // var specification = {};
        // specification['$unwind'] = {
        //     path: "$user",
        //     preserveNullAndEmptyArrays: false
        // };
        // filters.push(specification);

        // var specification = {};
        if (req.query.query) {
            var specification = {};
            specification['$lookup'] = {
                from: "User",
                localField: "user",
                foreignField: "_id",
                as: "user",
            };
            req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                $or: [
                    { 'type': { $regex: req.query.query, $options: 'i' } },
                    // { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                    {
                        "user": {
                            $elemMatch: {
                                "contact_no": { $regex: req.query.query, $options: 'i' }
                            }
                        }
                    },
                ]
            };

            filters.push(specification)
        }

        else if (req.query.date) {
            var date = new Date();
            //from 10-05-21to13-07-21
            if (req.query.dateType == "range") {
                var query = req.query.date;
                var ret = query.split("to");
                var from = new Date(ret[0]);
                var to = new Date(ret[1]);
            }

            // 70 Days
            else if (req.query.dateType == "period") {
                if (parseInt(req.query.date) > 1) {
                    var days = parseInt(req.query.date);
                    var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
                    var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                } else if (parseInt(req.query.date) == 0) {
                    var query = parseInt(req.query.date);
                    var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                }
                else if (parseInt(req.query.date) == 1) {
                    var query = parseInt(req.query.date);
                    var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
                    var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                }
            }
            else {
                var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }
            // console.l.log("From = " + from)
            // console.l.log("To  = " + to)
            var specification = {};
            specification['transaction_date'] = { $gte: from, $lte: to };
            filters.push(specification);

        }

    }
    var query = {
        "$match": {
            "$and": filters
        }

    }
    var results = []
    var total = await Statements.aggregate([query]).exec();
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Transactions details, " + "User:" + user.name);
    }
    await Statements.aggregate([
        query,
        { $sort: { 'transaction_date': -1 } },
        { $skip: 10 * page },
        { $limit: 10 }
    ])
        .allowDiskUse(true)

        .cursor({ batchSize: 20 })
        .exec()
        .eachAsync(async function (transaction) {
            var statementData = {};
            var details = await q.all(businessFunctions.getStatementDetails({ user: transaction.user, business: transaction.business }));
            if (details) {
                // console.l.l.log("Data = " + JSON.stringify(details));
                statementData = {
                    totalSale: details.totalSale - details.totalSaleCancelled,
                    totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                    totalPaymentIn: details.totalPaymentIn,
                    totalPaymentOut: details.totalPaymentOut,
                    totalPurchaseCancelled: details.totalPurchaseCancelled,
                    totalSaleCancelled: details.totalPurchaseCancelled,
                    balance: details.balance,
                    lastTransaction: details.lastTransaction,
                    user: details.party
                }
            }
            results.push({
                user: transaction.user,
                transaction_id: transaction.transaction_id,
                payment_mode: transaction.payment_mode,
                transaction_amount: transaction.transaction_amount,
                balance: transaction.balance,
                statementDetails: statementData,
                transaction_date: transaction.transaction_date,
                created_at: moment(transaction.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(transaction.updated_at).tz(req.headers['tz']).format('lll'),
            });
        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Transactions details in the response," + " " + "User:" + user.name);
    }
    res.status(200).json({
        responseCode: 200,
        responseInfo: {
            // filters: filters,
            totalResult: total.length
        },
        responseMessage: "Total " + req.query.type,
        totalLeads: results.length,
        responseData: results,

    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Payment List Send in Response Successfully," + " " + "Type:" + req.query.type + ", " + "User:" + user.name);
    }
    // else {
    //     var query = {
    //         type: 'Payment-In', business: business, payment_status: { $ne: 'Failure' }
    //     }
    // }


    // var totalResult = await User.find(query).count();
    // console.l.l.log("Total Result  = " + totalResult)
    // await Statements.find(query)
    //     .skip(limit * page).limit(limit)
    //     .sort({ created_at: -1 })
    //     .populate({ path: 'user', select: 'name contact_no' })
    //     .cursor().eachAsync(async (statement) => {
    //         var statementData = {};

    //         var details = await q.all(businessFunctions.getStatementDetails({ user: statement.user._id, business: statement.business }));
    //         if (details) {
    // console.l.l.log("Data = " + JSON.stringify(details));
    //             statementData = {
    //                 // party: party,
    //                 totalSale: details.totalSale - details.totalSaleCancelled,
    //                 totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
    //                 totalPaymentIn: details.totalPaymentIn,
    //                 totalPaymentOut: details.totalPaymentOut,
    //                 totalPurchaseCancelled: details.totalPurchaseCancelled,
    //                 totalSaleCancelled: details.totalPurchaseCancelled,
    //                 balance: details.balance,
    //                 lastTransaction: details.lastTransaction
    //             }
    //         }

    //         result.push({
    //             user: statement.user,
    //             business: statement.business,
    //             statement: statementData,
    //             // referral_code: user.referral_code,
    //             contact_no: statement.user.contact_no,
    //             business_info: user.business_info,
    //             account_info: user.account_info,
    //             // type: user.account_info.type,
    //             // address: user.address,
    //             // bank_details: user.bank_details,

    //             // agent: user.agent,
    //             // partner: user.partner,
    //             // plans_details: busi,
    //             created_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
    //             updated_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
    //         })
    //     });

    // result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
    // res.status(200).json({
    //     responseCode: 200,
    //     responseInfo: {
    //         totalResult: totalResult
    //     },
    //     responseQuery: query,
    //     responseMessage: "success",
    //     responseData: result
    // });

})
router.get('/payment/In-Out/list/get', xAccessToken.token, async function (req, res, next) {
    console.log("Api Called")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];

    if (req.query.page) {
        var page = req.query.page;
    }
    else {
        var page = 0
    }
    var page = Math.max(0, parseInt(page));

    var filters = [];
    if (req.query.type == 'Payment-In' || req.query.type == 'Payment-Out') {
        if (req.query.query) {
            var filters = [];
            var specification = {};
            specification['$lookup'] = {
                from: "User",
                localField: "user",
                foreignField: "_id",
                as: "user",
            };
            filters.push(specification);

            var specification = {};
            specification['$unwind'] = {
                path: "$user",
                preserveNullAndEmptyArrays: false
            };
            filters.push(specification);

            req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
            console.log("Data = " + req.query.query)
            var specification = {};
            specification['$match'] = {
                type: req.query.type,
                business: mongoose.Types.ObjectId(business),
                $or: [
                    // { 'type': { $regex: req.query.query, $options: 'i' } },
                    { 'user.name': { $regex: req.query.query, $options: 'i' } },
                    { 'user.contact_no': { $regex: req.query.query, $options: 'i' } },
                    { 'transaction_id': { $regex: req.query.query, $options: 'i' } }
                ]
            };
            filters.push(specification)

            var specification = {};
            specification['$sort'] = {
                updated_at: -1,
            };
            filters.push(specification);

            var specification = {};
            specification['$skip'] = config.perPage * page;
            filters.push(specification);

            var specification = {};
            specification['$limit'] = config.perPage;
            filters.push(specification);

            var results = []
            var total = await Statements.aggregate(filters).exec();
            await Statements.aggregate(filters)
                .allowDiskUse(true)
                .cursor({ batchSize: 20 })
                .exec()
                .eachAsync(async function (transaction) {
                    var statementData = {};
                    var details = await q.all(businessFunctions.getStatementDetails({ user: transaction.user, business: transaction.business }));
                    if (details) {
                        // console.l.l.log("Data = " + JSON.stringify(details));
                        statementData = {
                            totalSale: details.totalSale - details.totalSaleCancelled,
                            totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                            totalPaymentIn: details.totalPaymentIn,
                            totalPaymentOut: details.totalPaymentOut,
                            totalPurchaseCancelled: details.totalPurchaseCancelled,
                            totalSaleCancelled: details.totalPurchaseCancelled,
                            balance: details.balance,
                            lastTransaction: details.lastTransaction,
                            user: details.party
                        }
                    }
                    results.push({
                        user: transaction.user,
                        transaction_id: transaction.transaction_id,
                        payment_mode: transaction.payment_mode,
                        transaction_amount: transaction.transaction_amount,
                        balance: transaction.balance,
                        statementDetails: statementData,
                        transaction_date: transaction.transaction_date,
                        created_at: moment(transaction.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(transaction.updated_at).tz(req.headers['tz']).format('lll'),
                    });
                });

            res.status(200).json({
                responseCode: 200,
                responseInfo: {
                    // filters: filters,
                    totalResult: total.length
                },
                responseMessage: "Total " + req.query.type,
                totalLeads: results.length,
                responseData: results,
            });
        } else {
            var specification = {};
            specification['type'] = req.query.type;
            specification['business'] = mongoose.Types.ObjectId(business);
            filters.push(specification);
            if (req.query.date) {
                var date = new Date();
                //from 10-05-21to13-07-21
                if (req.query.dateType == "range") {
                    var query = req.query.date;
                    var ret = query.split("to");
                    var from = new Date(ret[0]);
                    var to = new Date(ret[1]);
                }

                // 70 Days
                else if (req.query.dateType == "period") {
                    if (parseInt(req.query.date) > 1) {
                        var days = parseInt(req.query.date);
                        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
                        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                    } else if (parseInt(req.query.date) == 0) {
                        var query = parseInt(req.query.date);
                        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                    }
                    else if (parseInt(req.query.date) == 1) {
                        var query = parseInt(req.query.date);
                        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
                        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    }
                }
                else {
                    var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                }
                var specification = {};
                specification['transaction_date'] = { $gte: from, $lte: to };
                filters.push(specification);

            }
            var query = {
                "$match": {
                    "$and": filters
                }

            }
            var results = []
            var total = await Statements.aggregate([query]).exec();
            await Statements.aggregate([
                query,
                { $sort: { 'transaction_date': -1 } },
                { $skip: 10 * page },
                { $limit: 10 }
            ])
                .allowDiskUse(true)
                .cursor({ batchSize: 20 })
                .exec()
                .eachAsync(async function (transaction) {
                    var statementData = {};
                    var details = await q.all(businessFunctions.getStatementDetails({ user: transaction.user, business: transaction.business }));
                    if (details) {
                        // console.l.l.log("Data = " + JSON.stringify(details));
                        statementData = {
                            totalSale: details.totalSale - details.totalSaleCancelled,
                            totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                            totalPaymentIn: details.totalPaymentIn,
                            totalPaymentOut: details.totalPaymentOut,
                            totalPurchaseCancelled: details.totalPurchaseCancelled,
                            totalSaleCancelled: details.totalPurchaseCancelled,
                            balance: details.balance,
                            lastTransaction: details.lastTransaction,
                            user: details.party
                        }
                    }
                    results.push({
                        user: transaction.user,
                        transaction_id: transaction.transaction_id,
                        payment_mode: transaction.payment_mode,
                        transaction_amount: transaction.transaction_amount,
                        balance: transaction.balance,
                        statementDetails: statementData,
                        transaction_date: transaction.transaction_date,
                        created_at: moment(transaction.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(transaction.updated_at).tz(req.headers['tz']).format('lll'),
                    });
                });

            res.status(200).json({
                responseCode: 200,
                responseInfo: {
                    // filters: filters,
                    totalResult: total.length
                },
                responseMessage: "Total " + req.query.type,
                totalLeads: results.length,
                responseData: results,
            });

        }
    }
})
router.get('/payment/In-Out/list/get/SimpleQuery', xAccessToken.token, async function (req, res, next) {
    // console.l.log("Api Called")
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];

    // if (req.query.page == undefined) {
    //     var page = 0;
    // } else {
    //     var page = req.query.page;
    // }
    // var page = Math.max(0, parseInt(page));

    // if (req.query.limit == undefined) {
    //     var limit = 20;
    // } else {
    //     var limit = parseInt(req.query.limit);
    // }

    // var list = []

    var query = {}
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var filters = [];
    if (req.query.type == 'Payment-In' || req.query.type == 'Payment-Out') {
        var specification = {}
        specification['business'] = mongoose.Types.ObjectId(business);
        specification['type'] = req.query.type;
        filters.push(specification);

        // var specification = {};
        // specification['$lookup'] = {
        //     from: "User",
        //     localField: "user",
        //     foreignField: "_id",
        //     as: "user",
        // };
        // filters.push(specification);

        // var specification = {};
        // specification['$unwind'] = {
        //     path: "$user",
        //     preserveNullAndEmptyArrays: false
        // };
        // filters.push(specification);


        // var specification = {};

        if (req.query.query) {
            var specification = {};
            specification['$lookup'] = {
                from: "User",
                localField: "user",
                foreignField: "_id",
                as: "user",
            };
            req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

            var specification = {};
            specification['$match'] = {
                business: mongoose.Types.ObjectId(business),
                $or: [
                    { 'type': { $regex: req.query.query, $options: 'i' } },
                    // { 'contact_no': { $regex: req.query.query, $options: 'i' } },
                    {
                        "user": {
                            $elemMatch: {
                                "contact_no": { $regex: req.query.query, $options: 'i' }
                            }
                        }
                    },
                ]
            };

            filters.push(specification)
        }

        else if (req.query.date) {
            var date = new Date();
            //from 10-05-21to13-07-21
            if (req.query.dateType == "range") {
                var query = req.query.date;
                var ret = query.split("to");
                var from = new Date(ret[0]);
                var to = new Date(ret[1]);
            }

            // 70 Days
            else if (req.query.dateType == "period") {
                if (parseInt(req.query.date) >= 1) {
                    var days = parseInt(req.query.date);
                    var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
                    var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                }
            }
            else {
                var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }
            var specification = {};
            specification['created_at'] = { $gte: from, $lte: to };
            filters.push(specification);

        }

    }
    var query = {
        "$match": {
            "$and": filters
        }

    }
    var results = []
    var total = await Statements.aggregate([query]).exec();
    await Statements.aggregate([
        query,
        { $sort: { 'created_at': -1 } },
        { $skip: 10 * page },
        { $limit: 10 }
    ])
        .allowDiskUse(true)

        .cursor({ batchSize: 20 })
        .exec()
        .eachAsync(async function (transaction) {
            var statementData = {};
            var details = await q.all(businessFunctions.getStatementDetails({ user: transaction.user, business: transaction.business }));
            if (details) {
                // console.l.log("Data = " + JSON.stringify(details));
                statementData = {
                    // party: party,
                    totalSale: details.totalSale - details.totalSaleCancelled,
                    totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                    totalPaymentIn: details.totalPaymentIn,
                    totalPaymentOut: details.totalPaymentOut,
                    totalPurchaseCancelled: details.totalPurchaseCancelled,
                    totalSaleCancelled: details.totalPurchaseCancelled,
                    balance: details.balance,
                    lastTransaction: details.lastTransaction,
                    user: details.party
                }
            }
            results.push({
                user: transaction.user,
                transaction_id: transaction.transaction_id,
                payment_mode: transaction.payment_mode,
                transaction_amount: transaction.transaction_amount,
                balance: transaction.balance,
                statementDetails: statementData,
                created_at: moment(transaction.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(transaction.updated_at).tz(req.headers['tz']).format('lll'),
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseInfo: {
            // filters: filters,
            totalResult: total.length
        },
        responseMessage: "Total " + req.query.type,
        totalLeads: results.length,
        responseData: results,

    });
    // else {
    //     var query = {
    //         type: 'Payment-In', business: business, payment_status: { $ne: 'Failure' }
    //     }
    // }


    // var totalResult = await User.find(query).count();
    // console.l.l.log("Total Result  = " + totalResult)
    // await Statements.find(query)
    //     .skip(limit * page).limit(limit)
    //     .sort({ created_at: -1 })
    //     .populate({ path: 'user', select: 'name contact_no' })
    //     .cursor().eachAsync(async (statement) => {
    //         var statementData = {};

    //         var details = await q.all(businessFunctions.getStatementDetails({ user: statement.user._id, business: statement.business }));
    //         if (details) {
    // console.l.l.log("Data = " + JSON.stringify(details));
    //             statementData = {
    //                 // party: party,
    //                 totalSale: details.totalSale - details.totalSaleCancelled,
    //                 totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
    //                 totalPaymentIn: details.totalPaymentIn,
    //                 totalPaymentOut: details.totalPaymentOut,
    //                 totalPurchaseCancelled: details.totalPurchaseCancelled,
    //                 totalSaleCancelled: details.totalPurchaseCancelled,
    //                 balance: details.balance,
    //                 lastTransaction: details.lastTransaction
    //             }
    //         }

    //         result.push({
    //             user: statement.user,
    //             business: statement.business,
    //             statement: statementData,
    //             // referral_code: user.referral_code,
    //             contact_no: statement.user.contact_no,
    //             business_info: user.business_info,
    //             account_info: user.account_info,
    //             // type: user.account_info.type,
    //             // address: user.address,
    //             // bank_details: user.bank_details,

    //             // agent: user.agent,
    //             // partner: user.partner,
    //             // plans_details: busi,
    //             created_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
    //             updated_at: moment(user.created_at).tz(req.headers['tz']).format('ll'),
    //         })
    //     });

    // result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
    // res.status(200).json({
    //     responseCode: 200,
    //     responseInfo: {
    //         totalResult: totalResult
    //     },
    //     responseQuery: query,
    //     responseMessage: "success",
    //     responseData: result
    // });

});

//test

/*Abhinav Work END For Party Statements */


// vinay code

router.get('/orders/vendors/get', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    let list = []
    let search = req.query.search
    let vendor = []
    let data = []
    let parts = []
    let services = ""
    let length = vendor.length;
    let query = {}
    // console.log("Search query..", req.query.search);
    if (search == "undefined") {
        // console.log("if Search query..", req.query.search);

        query = {
            $or: [{ "_id": { $in: list } }]
        }
    } else {
        // console.log("else Search query..", req.query.search);

        query = {
            $or: [
                {
                    "name": { $regex: req.query.search, $options: 'i' }
                },
                {
                    "contact_no": { $regex: req.query.search, $options: 'i' }
                },
                {
                    "business_info.gstin": { $regex: req.query.search, $options: 'i' }
                }
            ]
        }
    }




    let vendors = await BusinessVendor.find({ business: mongoose.Types.ObjectId(business) }).cursor()
        .eachAsync(async (v) => {
            list.push(mongoose.Types.ObjectId(v.vendor))
        })


    if (req.query.id) {
        let booking = await Booking.findOne({ _id: req.query.id }).exec()
        services = booking.services

        for (let j = 0; j < services.length; j++) {
            for (let i = 0; i < services[j].parts.length; i++) {
                let partsData = {
                    item: services[j].parts[i].item,
                    quantity: services[j].parts[i].quantity
                }
                parts.push(partsData)
            }
        }
    }


    await User.find(query)
        .limit(20)
        .cursor()
        .eachAsync(async (u) => {
            vendor.push(u)
        })

    vendor.forEach(async vendors => {
        let combine = {
            name: vendors.name,
            item: '',
            address: vendors.address.address,
            contact_no: vendors.contact_no,
            id: vendors._id
        }
        data.push(combine)
    })

    if (req.query.id) {
        for (let i = 0; i < parts.length; i++) {
            data[i].item = parts[i].item
        }
    } else {
        for (let i = 0; i < data.length; i++) {
            data[i].item = ""
            // data[i].item = parts[i].item
        }
    }

    res.json({
        suppliers: vendor,
        parts: parts,
        mergeData: data,
        totalParts: parts.length,
        totalSuppliers: vendor.length
    })
})





// router.post('/send/party/statments', async function (req, res, next) {
//     var token = req.headers['x-access-token'];
//     var secret = config.secret;
//     var decoded = jwt.verify(token, secret);
//     var user = decoded.user;
//     var business = req.headers['business'];
//     var details = req.body.details
//     var transactions = req.body.transactions
//     var type = req.body.type
//     var duration = req.body.duration

//     var partyDetails = transactions[0].user._id;
//     //var   partyDetails = details.party._id;
//     var userde








//     if (req.body.type == "email") {
//         await fun.partyStatement(partyDetails, duration, transactions);

//         setTimeout(function () {


//             event.sendStatement(partyDetails)
//         }, 10000);

//     }
//     else if (req.body.type == "whatsapp") {
//         await fun.partyStatement(partyDetails, duration, transactions);


//         setTimeout(function () {

//             whatsAppEvent.statmentSend(partyDetails, business);

//         }, 10000);

//     }


//     res.status(200).json({
//         responseCode: 200,
//         responseMessage: "Sent success",
//         responseData: {}
//     });
// });


router.post('/generate/party/statments', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var details = req.body.details
    var transactions = req.body.transactions
    var type = req.body.type
    var duration = req.body.duration

    //  var partyDetails= transactions[0].user._id;
    //var   partyDetails = details.party._id;

    //console.log('details.id'+details);


    await fun.partyStatement(details, duration, transactions)
    // if (data.url) {

    // }



    res.status(200).json({
        responseCode: 200,
        responseMessage: `Generated success`,
        responseData: {}
    });



});


router.post('/send/party/statments', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var type = req.body.type

    var partyDetails = req.body.partyDetails
    //var   partyDetails = details.party._id;

    var userInfo = await User.findOne({ _id: mongoose.Types.ObjectId(partyDetails) }).exec();
    var url = userInfo.business_info.party_statements
    if (url) {
        if (type == "email") {
            event.sendStatement(userInfo._id)
        }
        if (type == "whatsapp") {
            whatsAppEvent.statmentSend(userInfo._id, business);
        }
        return res.status(200).json({
            responseCode: 200,
            responseMessage: `Sent success`,
            responseData: partyDetails
        });
    }
    return res.status(400).json({
        responseCode: 400,
        responseMessage: "Invoice not found,please generate .",
        responseData: {}
    });
});
//
// Abhinav Services Description
router.get('/services/description/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        type: 'required',
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
        // var token = req.headers['x-access-token'];
        // var secret = config.secret;
        // var decoded = jwt.verify(token, secret);
        // var user = decoded.user;
        var business = req.headers['business'];
        carId = "5b290623e9367455c048efb3"    //Only to get Description of car Segments
        var totalResult = 0;
        var car = await Variant.findById(carId).populate('model').exec();
        if (car) {
            var packages = [];

            if (req.query.type == "services") {
                await Service.find({ segment: car.model.segment, part_cost: 0, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });

                await Service.find({ model: car.model._id, part_cost: { $gt: 0 }, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {

                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            // gallery: gallery.length,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });
                    });
            }

            else if (req.query.type == "collision") {
                // console.log("Working.....")
                await Collision.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });

            }

            else if (req.query.type == "customization") {
                await Customization.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {

                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });
            }

            else if (req.query.type == "detailing") {
                await Detailing.find({ segment: car.model.segment, publish: true, business: business })
                    .cursor().eachAsync(async (service) => {
                        packages.push({
                            package: service.package,
                            service: service.service,
                            type: service.type,
                            source: service.id,
                            description: service.description,
                            id: service.id,
                            _id: service._id,
                            profile: service.profile,
                        });

                        packageDiscountOn = []
                    });
            }

            packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: packages
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
});
router.post('/send/payment/request', xAccessToken.token, async function (req, res, next) {
    var rules = {
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
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];
        // console.log(business);
        let user_id = req.body.user;
        let amount = req.body.amount;
        let activity = req.body.activity;
        let user_info = await User.findById(user_id).exec();
        // var loggedInDetails = await User.findById(decoded.user).exec();
        if (user_info) {
            if (activity == "email") {
                await event.paymentLink(user_info, amount, business);
            } else if (activity == "whatsapp") {
                whatsAppEvent.paymetRequest(amount, user_info, business);
            }

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Payment Request has been sent",
                responseData: {}
            });
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
//Parties Export For Tally
router.get('/tally/ledger/export', async function (req, res, next) {
    try {
        // const business = req.user;
        const business = '5bfec47ef651033d1c99fbca';
        if (req.query.page == undefined) {
            var page = 0;
        }
        else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));
        let parties = []

        //Booking Invoice Users
        let invoices = await Invoice.aggregate([
            {
                $lookup: {
                    from: "User",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "Address",
                    localField: "address",
                    foreignField: "_id",
                    as: "address",
                }
            },
            {
                $unwind: {
                    path: "$address",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $match: { business: mongoose.Types.ObjectId(business), status: { $nin: ["Cancelled"] } }
            },
            {
                $group: {
                    _id: { name: '$user.name' },
                    // user: { $last: '$user' },
                    name: { $last: '$user.name' },
                    parent: { $last: '$user.business_info.company' },
                    // opening_bal: { $last: '$user.business_info.company' },
                    contact_no: { $last: '$user.contact_no' },
                    alternate_no: { $last: '$user.optional_info.alternate_no' },
                    email: { $last: '$user.email' },
                    address: { $last: '$address' },
                    account_info: { $last: '$user.account_info.type' },
                    gst_type: { $last: '$user.business_info.gst_registration_type' }, //Regular
                    // gst_type: { $cond: { if: { $ne: ['$user.business_info.gstin', ''] }, then: 'Consumer', else: 'Regular' } },
                    gstin: { $last: '$user.business_info.gstin' },
                    username: { $last: '$user.username' },
                    created_at: { $last: '$created_at' }
                },
            },

            { $sort: { "created_at": 1 } },
        ])
        // parties = parties.concat(invoices)

        //Order Invoice Users
        let orderInvoice = await OrderInvoice.aggregate([
            {
                $lookup: {
                    from: "User",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: false
                }
            },

            {
                $match: { business: mongoose.Types.ObjectId(business), status: { $nin: ["Cancelled"] } }
            },
            {
                $group: {
                    _id: { name: '$user.name' },
                    // user: { $last: '$user' },
                    name: { $last: '$user.name' },
                    parent: { $last: '$user.business_info.company' },
                    // opening_bal: { $last: '$user.business_info.company' },
                    contact_no: { $last: '$user.contact_no' },
                    alternate_no: { $last: '$user.optional_info.alternate_no' },
                    email: { $last: '$user.email' },
                    address: { $last: '$user.address' },
                    account_info: { $last: '$user.account_info.type' },
                    gst_type: { $last: '$user.business_info.gst_registration_type' }, //Regular
                    // gst_type: { $cond: { if: { $ne: ['$user.business_info.gstin', ''] }, then: 'Consumer', else: 'Regular' } },
                    gstin: { $last: '$user.business_info.gstin' },
                    username: { $last: '$user.username' },
                    created_at: { $last: '$created_at' }
                },
            },

            { $sort: { "created_at": 1 } },
        ]);
        // parties = parties.concat(orderInvoice)

        let leadger = [...invoices, ...orderInvoice]
        // parties = await q.all(businessFunctions.removeDublicateDoumnets(parties, "name"));
        leadger = await q.all(businessFunctions.removeDublicateDoumnets(leadger, "name"));

        // .allowDiskUse(true)
        //     .cursor({})
        //     .exec()
        //     .eachAsync(async function (p) {
        //         if (!p.address) {
        //             p.address = await Address.findOne({ user: p.user }).sort({ _id: -1 }).lean();
        //         }
        //         sales.push(p);

        //     })
        console.log("leadger length = " + leadger.length)
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: {
                sales: leadger,
            }
        })
    }
    catch (err) {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Internal Server error",
            responseData: err
        })
    }

});

//
router.get('/export/party/statements/to/tally', xAccessToken.token, async function (req, res, next) {
    let business = req.headers['business'];
    var duration = {}
    let transactions = [];
    if (req.query.date) {
        var date = new Date();
        //from 10-05-21 to 13-07-21
        if (req.query.dateType == "range") {
            var query = req.query.date;
            var ret = query.split("to");
            var from = new Date(ret[0]);
            var to = new Date(ret[1]);
        }

        // 70 Days
        else if (req.query.dateType == "period") {
            if (parseInt(req.query.date) > 1) {
                var days = parseInt(req.query.date);
                var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
                var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            } else if (parseInt(req.query.date) == 0) {
                var query = parseInt(req.query.date);
                var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }
            else if (parseInt(req.query.date) == 1) {
                var query = parseInt(req.query.date);
                var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
                var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            }
        }
        else {
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        var duration = {
            from: from,
            to: to
        };

        query = {
            user: req.query.user, payment_status: { $ne: "Failure" }, business: business, transaction_date: { $gte: from, $lte: to }
        }
        var totalResult = await Statements.find(query).count();
        await Statements.find(query)
            .populate({ path: 'user', select: 'name contact_no' })
            .populate({ path: 'business', select: 'name contact_no' })
            .cursor().eachAsync(async (statements) => {
                transactions.push({
                    user: statements.user,
                    business: statements.business,
                    status: statements.status,
                    type: statements.type,
                    paid_by: statements.paid_by,
                    activity: statements.activity,
                    source: statements.source,
                    bill_id: statements.bill_id,
                    bill_amount: statements.bill_amount,
                    transaction_amount: statements.transaction_amount,
                    balance: statements.balance,
                    total: statements.total,
                    paid_total: statements.paid_total,
                    // due: parseFloat(statements.bill_amount) - parseFloat(statements.paid_total),
                    payment_status: statements.payment_status,
                    payment_mode: statements.payment_mode,
                    received_by: statements.received_by,
                    transaction_id: statements.transaction_id,
                    transaction_date: statements.transaction_date,
                    transaction_status: statements.transaction_status,
                    transaction_response: statements.transaction_response,
                    // transaction_type: statements.transaction_type,
                });
            });
    }
    // result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
    res.status(200).json({
        responseCode: 200,
        responseInfo: {
            totalResult: totalResult,
            duration: duration
        },
        responseQuery: query,
        responseMessage: "success",
        responseData: transactions
    });

})
module.exports = router