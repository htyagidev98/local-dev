var mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router(),
    config = require('../../../../config'),
    businessFunctions = require('../../businessFunctions'),
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

// app.use(bodyParser.json());
//webpush = require('web-push');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});


var client = redis.createClient({ host: 'localhost', port: 6379 });

const xAccessToken = require('../../../../middlewares/xAccessTokenBusiness');
const fun = require('../../../function');
const event = require('../../../event');
const whatsAppEvent = require('../../../whatsapp/whatsappEvent')
var paytm_config = require('../../../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../../../paytm/checksum');

var salt = bcrypt.genSaltSync(10);
const User = require('../../../../models/user');
const BusinessTiming = require('../../../../models/businessTiming');
const BusinessConvenience = require('../../../../models/businessConvenience');
const BookingTiming = require('../../../../models/bookingTiming');
// const Type = require('../../../../models/type');
// const BusinessType = require('../../../../models/businessType');
const Category = require('../../../../models/category');
const Automaker = require('../../../../models/automaker');
const Model = require('../../../../models/model');
const QuotationOrders = require('../../../../models/quotationOrders')
const OrderLogs = require('../../../../models/orderLogs')
const State = require('../../../../models/state');
const BookingCategory = require('../../../../models/bookingCategory');
const ProductImage = require('../../../../models/productImage');
const Country = require('../../../../models/country');
const BusinessOffer = require('../../../../models/businessOffer');
const BusinessUser = require('../../../../models/businessUser');
const ProductOffer = require('../../../../models/productOffer');
const Order = require('../../../../models/order');
const BusinessOrder = require('../../../../models/businessOrder');
const OrderLine = require('../../../../models/orderLine');
const OrderConvenience = require('../../../../models/orderConvenience');
const OrderInvoice = require('../../../../models/orderInvoice');
const BookmarkProduct = require('../../../../models/bookmarkProduct');
const BookmarkOffer = require('../../../../models/bookmarkOffer');
const Car = require('../../../../models/car');
const CarSell = require('../../../../models/carSell');
const Asset = require('../../../../models/asset');
const CarImage = require('../../../../models/carImage');
const CarDocument = require('../../../../models/carDocument');
const BookmarkCar = require('../../../../models/bookmarkCar');
const BodyStyle = require('../../../../models/bodyStyle');
const FuelType = require('../../../../models/fuelType');
const Transmission = require('../../../../models/transmission');
const Color = require('../../../../models/color');
const Owner = require('../../../../models/owner');
const ServiceGallery = require('../../../../models/serviceGallery'); //abhinav
const BusinessGallery = require('../../../../models/businessGallery');
const Variant = require('../../../../models/variant');
const ClaimBusiness = require('../../../../models/claimBusiness');
const Review = require('../../../../models/review');
const Battery = require('../../../../models/battery');
const BatteryBrand = require('../../../../models/batteryBrand');
const TyreSize = require('../../../../models/tyreSize');
const Booking = require('../../../../models/booking');
const Lead = require('../../../../models/lead');
const Service = require('../../../../models/service');
const Customization = require('../../../../models/customization');
const Collision = require('../../../../models/collision');
const Washing = require('../../../../models/washing');
const ProductCategory = require('../../../../models/productCategory');
const Product = require('../../../../models/product');
const ProductBrand = require('../../../../models/productBrand');
const ProductModel = require('../../../../models/productModel');
const BusinessProduct = require('../../../../models/businessProduct');
const LeadRemark = require('../../../../models/leadRemark');
const LeadGenRemark = require('../../../../models/leadGenRemark');
const LeadStatus = require('../../../../models/leadStatus');
const Package = require('../../../../models/package');
const UserPackage = require('../../../../models/userPackage');
const PackageUsed = require('../../../../models/packageUsed');
const Management = require('../../../../models/management');
const LeadManagement = require('../../../../models/leadManagement');
const Address = require('../../../../models/address');
const Gallery = require('../../../../models/gallery');
const Coupon = require('../../../../models/coupon');
const Detailing = require('../../../../models/detailing');
const CouponUsed = require('../../../../models/couponUsed');
const Purchase = require('../../../../models/purchase');
const PurchaseReturn = require('../../../../models/purchaseReturn');
const PurchaseOrder = require('../../../../models/purchaseOrder');
const Tax = require('../../../../models/tax');
const BusinessVendor = require('../../../../models/businessVendor');
const JobInspection = require('../../../../models/jobInspection');
const ClubMember = require('../../../../models/clubMember');
const InsuranceCompany = require('../../../../models/insuranceCompany');
const LabourRate = require('../../../../models/labourRate');
const Point = require('../../../../models/point');
const QualityCheck = require('../../../../models/qualityCheck');
const Invoice = require('../../../../models/invoice');
const Expense = require('../../../../models/expense');
const Estimate = require('../../../../models/estimate');
const StockLogs = require('../../../../models/stockLogs');
// Vinay Model added
const VendorOrders = require('../../../../models/vendorOrders');

const TransactionLog = require('../../../../models/transactionLog');
const RFQ = require('../../../../models/rfq');
const Quotation = require('../../../../models/quotation');
const BusinessPlan = require('../../../../models/businessPlan');
const Referral = require('../../../../models/referral');
const ManagementRole = require('../../../../models/managementRole');
const Location = require('../../../../models/location');
const BusinessSetting = require('../../../../models/businessSetting');
const ExpenseCategory = require('../../../../models/expenseCategory');
const ReviewPoint = require('../../../../models/reviewPoint');
const LeadGen = require('../../../../models/leadGen');
const SuitePlan = require('../../../../models/suitePlan');
const { updateMany } = require('../../../../models/user');
const { filter, rangeRight } = require('lodash');



var secret = config.secret;

router.put('/car/edit', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: "required",
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

        var user = req.headers['business'];
        var result;

        var loggedInDetails = await User.findOne({ _id: decoded.user }).exec();
        var car = await Car.findOne({ _id: req.body.car, user: user }).populate('user').exec();
        var variant = await Variant.findOne({ _id: req.body.variant }).select('-service_schedule').exec();
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
                if (variant) {
                    var automaker = await Automaker.findById(variant.model.automaker).exec();

                    var publish = false;
                    if (req.body.publish == true) {
                        publish = true;

                    }

                    if (car.user.partner) {
                        if (car.user.partner.partner == true) {
                            req.body.is_package == true
                        }
                    }

                    var package = null;

                    if (publish == true) {
                        if (req.body.is_package == true) {
                            var getpackage = await Package.findOne({ name: "#CarEagerClub Membership" }).exec();
                            package = getpackage._id;
                        }
                    }

                    if (variant.specification.type) {
                        req.body.transmission = variant.specification.type
                    }

                    req.body.geometry = [req.body.longitude, req.body.latitude];
                    req.body.automaker = variant.automaker;
                    req.body._automaker = variant._automaker;
                    req.body.model = variant.model;
                    req.body._model = variant._model;
                    req.body.title = variant.variant;
                    req.body._variant = variant.value;
                    req.body.segment = variant.segment;
                    req.body.fuel_type = variant.specification.fuel_type;
                    req.body.package = package;
                    req.body.posted_by = "business";
                    req.body.updated_at = new Date();

                    Car.findOneAndUpdate({ _id: req.body.car, user: user }, { $set: req.body }, { new: false }, async function (err, s) {
                        if (err) {
                            res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Error occured",
                                responseData: err
                            });
                        }
                        else {
                            if (publish == true) {
                                var log = {
                                    user: loggedInDetails._id,
                                    name: loggedInDetails.name,
                                    status: "Published",
                                    remark: "",
                                    updated_at: new Date(),
                                    created_at: new Date(),
                                };

                                var sell = await CarSell.findOne({ car: car._id, sold: false }).exec();
                                if (sell) {
                                    CarSell.findOneAndUpdate({ car: car._id, sold: false }, {
                                        $set: {
                                            otp: Math.floor(Math.random() * 90000) + 10000,
                                            user_verified: true,
                                            admin_verified: false,
                                        }
                                    }, { new: false }, async function (err, doc) {
                                        if (err) {
                                            // console.log(err)
                                        }
                                        else {
                                            event.sellerApproval(sell._id, req.headers['tz'])
                                        }
                                    })
                                }
                                else {
                                    CarSell.create({
                                        car: car._id,
                                        seller: car.user,
                                        owner: car.user,
                                        buyer: null,
                                        otp: Math.floor(Math.random() * 90000) + 10000,
                                        user_verified: true,
                                        admin_verified: false,
                                        created_at: new Date(),
                                        updated_at: new Date(),
                                    }).then(function (d) {
                                        event.sellerApproval(d._id, req.headers['tz'])
                                    });
                                }
                            }

                            fun.addMember(user, variant.model);

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

                            var responseMessage = "Successfully updated";

                            if (publish == true) {
                                responseMessage = "Car has been sent to admin for approval";
                            }

                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: responseMessage,
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
});

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

router.post('/car/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);


    var business = req.headers['business'];

    var limit = await q.all(businessFunctions.businessPlanLimit(business, req.headers['tz']));


    var added = await Car.find({ user: business, status: true }).count().exec();
    if (limit) {
        if (limit.cars > added) {
            var result = new Object();
            var userInfo = await User.findById(business).exec();
            var currentDate = new Date();
            var variant = await Variant.findOne({ _id: req.body.variant }).select('-service_schedule').exec();
            var rg = req.body.registration_no;
            req.body.registration_no = rg.replace(/ /g, '');

            if (variant != null && variant) {
                var reg = await Car.find({ registration_no: req.body.registration_no, status: true }).count().exec();
                if (reg == 0) {
                    var count = await Car.find({}).count().exec();

                    if (req.body.longitude != undefined || req.body.longitude != null && req.body.latitude != undefined || req.body.latitude != null) {
                        req.body.geometry = [req.body.longitude, req.body.latitude];
                    } else {
                        req.body.geometry = [0, 0];
                    }


                    var automaker = await Automaker.findById(variant.model.automaker).exec();

                    req.body.created_at = currentDate;
                    req.body.updated_at = currentDate;

                    req.body.title = variant.variant;
                    req.body._variant = variant.value;
                    req.body.automaker = variant.automaker;
                    req.body._automaker = variant._automaker;
                    req.body.model = variant.model;
                    req.body._model = variant._model;
                    req.body.segment = variant.segment;
                    req.body.user = business;
                    req.body.fuel_type = variant.specification.fuel_type;
                    req.body.transmission = variant.specification.type;
                    req.body.carId = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),

                        Car.create(req.body).then(async function (car) {
                            User.findOneAndUpdate({ _id: business }, {
                                $push: {
                                    "cars": car._id
                                }
                            }, { new: true }, async function (err, doc) {
                                if (err) {
                                    // console.log(err)
                                } else {
                                    // console.log(err)
                                }
                            })

                            //fun.addMember(b,variant.model);

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
                                responseMessage: "Car has been added",
                                responseData: {
                                    item: result
                                }
                            });
                        });
                } else {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Registration no already exist",
                        responseData: {}
                    });
                }
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Unprocessable Entity",
                    responseData: {}
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Limit Exceed!",
                responseData: {}
            });
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Plan expired",
            responseData: {}
        });
    }
});

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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var user = req.headers['business'];

        var car = await Car.findOne({ _id: req.body.car, user: user }).populate('user').exec();
        if (car) {
            var data = {
                status: false,
                updated_at: new Date()
            }

            Car.findOneAndUpdate({ _id: req.body.car, user: user }, { $set: data }, { new: false }, async function (err, s) {
                if (err) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: err
                    });
                } else {
                    var cars = [];
                    await Car.find({ user: user, status: true })
                        .cursor().eachAsync(async (car) => {
                            cars.push(mongoose.Types.ObjectId(car._id))
                        });

                    var newvalues = {
                        $set: { cars: cars }
                    }

                    User.findOneAndUpdate({ _id: user }, newvalues, { new: false }, async function (err, s) {
                        if (err) {
                            res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Error occured",
                                responseData: err
                            });
                        } else {
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Car has been deleted",
                                responseData: {}
                            });
                        }
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
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
        var business = req.headers['business'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

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
        var business = req.headers['business'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

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

router.delete('/car/unpublish', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var loggedInDetails = await User.findById(decoded.user).exec();
    var car = await Car.findById(req.body.car).populate('user').exec();

    if (car) {
        if (loggedInDetails) {
            var check_listing = await CarSell.findOne({ car: car._id, seller: business, sold: false }).exec();
            if (check_listing) {
                Car.findOneAndUpdate({ _id: car._id }, {
                    $set: {
                        user: check_listing.owner,
                        publish: false,
                        package: null,
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
                        CarSell.findByIdAndRemove(check_listing._id).exec();
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully unpublished",
                            responseData: {}
                        })
                    }
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
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Seller not found",
                responseData: {}
            })
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Unauthorized",
            responseData: {}
        })
    }
});

router.get('/car/documents/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var document = await CarDocument.find({ user: business, car: req.query.car }).exec();

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: document
    })
});

router.post('/car/document/add/', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    let extension = "";
    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/car',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                let extArray = file.mimetype.split("/");
                extension = extArray[extArray.length - 1];
                var filename = uuidv1() + '.' + extension;

                if (extension == "msword") {
                    extension = "doc"
                }
                if (extension == "vnd.openxmlformats-officedocument.wordprocessingml.document") {
                    extension = "docx"
                }

                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif' || extension == 'pdf' || extension == 'doc' || extension == 'docx') {
                    cb(null, filename);
                }
                else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/car",
                        Key: filename
                    };
                    s3.deleteObject(params, async function (err, data) {
                        var json = ({
                            responseCode: 422,
                            responseMessage: "Invalid extension",
                            responseData: filename
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
                user: req.headers['business'],
                car: req.body.id,
                file_type: extension.toUpperCase(),
                caption: _.startCase(_.toLower(req.body.caption)),
                file: req.files[0].key,
                created_at: new Date(),
                updated_at: new Date(),
            };

            var carDocument = new CarDocument(data);
            carDocument.save();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been uploaded",
                responseData: carDocument
            })
        }
    });
});

router.delete('/car/document/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var image_id = req.body.id;
    const media = await CarDocument.findById(image_id).exec();

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
                await CarDocument.findByIdAndRemove(image_id).exec();
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

router.post('/user/car/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];

    var currentDate = new Date();

    /*var booking = await Booking.findOne({_id:req.body.id}).select('-service_schedule').exec();*/
    var user = await User.findOne({ _id: req.body.user }).exec();
    var variant = await Variant.findOne({ _id: req.body.variant }).select('-service_schedule').exec();

    if (user) {
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
                req.body._variant = variant.value;
                req.body.automaker = variant.automaker;
                req.body._automaker = variant._automaker;
                req.body.model = variant.model;
                req.body._model = variant._model;
                req.body.segment = variant.segment;
                req.body.user = req.body.user;
                req.body.vin = req.body.vin;
                req.body.engine_no = req.body.engine_no;
                req.body.fuel_type = variant.specification.fuel_type;
                req.body.transmission = variant.specification.type;
                req.body.carId = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),

                    Car.create(req.body).then(async function (car) {
                        User.findOneAndUpdate({ _id: user._id }, {
                            $push: {
                                "cars": car._id
                            }
                        }, { new: true }, async function (err, doc) {
                            if (err) {
                                // console.log(err)
                            }
                            else {
                                // console.log(err)
                            }
                        })

                        fun.addMember(req.body.user, variant.model);

                        /*Booking.findOneAndUpdate({_id: booking._id}, {$set:{car:car._id}},{new: false}, async function(err, doc){*/

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
                                    price: 0,
                                    numericPrice: doc.price,
                                    vin: doc.vin,
                                    engine_no: doc.engine_no,
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
                                    //link: "/car/"+slugify(doc.title+" "+doc._id),
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
                            responseMessage: "Car has been added",
                            responseData: {
                                item: result
                            }
                        });
                        /*});*/

                    });
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "registration no already exist",
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
            responseMessage: "user not found",
            responseData: {}
        });
    }
});
let updateServicePrices = (servicePrice, service, type, item, serviceType) => {

    let totalAmount = 0
    let labourCost = 0
    let partsCost = 0
    let tax_data = {}
    // console.log("Your service type is here ........", type, servicePrice, item)
    for (let j = 0; j < service[type].length; j++) {
        if (item == service[type][j].item) {
            // console.log('Parts condition matched...')
            service[type][j].rate = parseFloat(servicePrice)
            let newService = businessFunctions.calculateTax(service[type][j], servicePrice, 'serviceTax')
            service[type].pop()
            service[type].push(newService)
            break;
        }
    }

    service.labour.forEach(data => {
        let rate = Number(data.rate)
        totalAmount += rate
        labourCost += rate
    })
    service.parts.forEach(data => {
        let rate = Number(data.rate)
        totalAmount += rate
        partsCost += rate
    })

    service.labour_cost = labourCost
    service.part_cost = partsCost
    service.cost = totalAmount
    service.updated_at = new Date();
    if (serviceType == 'detailing') {
        let newService = businessFunctions.calculateTax(service, totalAmount, 'totalTax')
        Object.assign(tax_data, newService.tax_info)
        service.tax_info = tax_data
    }
}

// let updateServicePrices = (servicePrice, service, type, item, serviceType) => {

//     let totalAmount = 0
//     let labourCost = 0
//     let partsCost = 0
//     let tax_data = {}
//     console.log("Your service type is here ........", type, servicePrice, item)
//     for (let j = 0; j < service[type].length; j++) {
//         if (item == service[type][j].item) {
//             // console.log('Parts condition matched...')
//             service[type][j].rate = servicePrice
//             let newService = businessFunctions.calculateTax(service[type][j], servicePrice, 'serviceTax')
//             service[type].pop()
//             service[type].push(newService)
//             break;
//         }
//     }

//     service.labour.forEach(data => {
//         let rate = Number(data.rate)
//         totalAmount += rate
//         labourCost += rate
//     })
//     service.parts.forEach(data => {
//         let rate = Number(data.rate)
//         totalAmount += rate
//         partsCost += rate
//     })

//     service.labour_cost = labourCost
//     service.part_cost = partsCost
//     service.cost = totalAmount
//     service.updated_at = new Date();
//     if (serviceType == 'detailing') {
//         let newService = businessFunctions.calculateTax(service, totalAmount, 'totalTax')
//         Object.assign(tax_data, newService.tax_info)
//         service.tax_info = tax_data
//     }



//     // type: This variable contains (labour or parts) string of which admin wants to
//     //         change the prices


//     let updateServicePrices = (servicePrice, service, type, item, serviceType) => {

//         let totalAmount = 0
//         let labourCost = 0
//         let partsCost = 0
//         let tax_data = {}

//         for (let j = 0; j < service[type].length; j++) {
//             if (item == service[type][j].item) {
//                 service[type][j].rate = servicePrice
//                 let newService = businessFunctions.calculateTax(service[type][j], servicePrice, 'serviceTax')
//                 service[type].pop()
//                 service[type].push(newService)
//                 break;
//             }
//         }

//         service.labour.forEach(data => {
//             let rate = Number(data.rate)
//             totalAmount += rate
//             labourCost += rate
//         })
//         service.parts.forEach(data => {
//             let rate = Number(data.rate)
//             totalAmount += rate
//             partsCost += rate
//         })

//         service.labour_cost = labourCost
//         service.part_Cost = partsCost
//         service.cost = totalAmount
//         service.updated_at = new Date();
//         if (serviceType == 'detailing') {
//             let newService = businessFunctions.calculateTax(service, totalAmount, 'totalTax')
//             Object.assign(tax_data, newService.tax_info)
//             service.tax_info = tax_data
//         }
//     }

// }

// router.post('/services/update', xAccessToken.token, async (req, res, next) => {
//     // console.log('vinay rana')
//     var token = req.headers['x-access-token'];
//     var secret = config.secret;
//     var decoded = jwt.verify(token, secret);
//     var user = decoded.user;
//     var business = req.headers['business'];
//     // console.log('UserID', user)

//     // Request data assigning
//     let carId = req.body.car
//     let serviceId = req.body.serviceId
//     let updateType = req.body.updateType
//     let type = req.body.type
//     let item = req.body.item
//     let price = req.body.price
//     let getService = '';

//     // console.log("Your carId is here.....", carId)
//     // console.log("Your serviceId is here.....", serviceId)
//     // console.log("Your updateType is here.....", updateType)
//     // console.log("Your type is here.....", type)
//     // console.log("Your item is here.....", item)
//     // console.log("Your price is here.....", price)
//     console.log("Your car id is here.....", serviceId)
//     if (!carId || !serviceId) {
//         return res.status(404).json({
//             car: [],
//             error: 'Not Found'
//         })
//     }

//     var services = {
//         services: Service,
//         detailing: Detailing,
//         collision: Collision,
//         customization: Customization
//     }
//     // console.log("Business =" + business)
//     // var car = await Variant.findById(carId).populate('model').exec();
//     var serviceType = services[type]
//     // console.log("Car Model " + serviceType)
//     // console.log("Service Type " + car._model)
//     var serviceByModel = await serviceType.findOne({ business: mongoose.Types.ObjectId(business), _id: serviceId });
//     if (serviceByModel) {
//         if (updateType == 'mrp') {
//             serviceByModel[0].mrp = parseFloat(price)

//         } else {
//             // var cost = serviceByModel.cost - serviceByModel.labour_cost
//             var cost = parseFloat(price)
//             var labour_cost = parseFloat(cost) - parseFloat(serviceByModel.part_cost)
//             // console.log("Cost Price= " + cost)
//             var mrp = parseFloat(serviceByModel.mrp) - parseFloat(serviceByModel.cost)
//             mrp = parseFloat(mrp) + parseFloat(price)

//             // console.log("MRP = " + mrp)
//             await services[type].findOneAndUpdate({ business: business, _id: serviceId }, { $set: { cost: cost, mrp: mrp, labour_cost: labour_cost } }, { new: true }, async function (err, doc) {

//             });
//         }
//         var newData = await serviceType.findOne({ business: business, _id: serviceId });

//         res.status(200).json({
//             responseCode: 200,
//             responseMessage: "Service Updated",
//             responseData: newData
//         });
//     } else {
//         res.status(400).json({
//             responseCode: 400,
//             responseMessage: "Service Not Found ",
//             responseData: newData
//         });
//     }

//     // console.log("car.model.segment = " + car.model.segment)
//     // console.log("serviceByModel.length = " + serviceByModel.length)
//     // // return res.json({
//     // //     c: serviceByModel
//     // // })

//     // return res.json({
//     //     service: serviceByModel
//     // })
//     // if (serviceByModel.length > 0) {
//     //     if (updateType == 'mrp') {
//     //         serviceByModel[0].mrp = parseFloat(price)

//     //     } else if (updateType) {
//     //         // businessFunctions.updateServicePrices(price, serviceByModel[0], updateType, item, serviceType)
//     //         updateServicePrices(price, serviceByModel[0], updateType, item, serviceType)

//     //     }
//     // } else {
//     //     serviceByModel = await serviceType.find({
//     //         // segment: car.model.segment,
//     //         business: mongoose.Types.ObjectId(business),
//     //         _id: serviceId,
//     //     });

//     //     if (updateType == 'mrp') {
//     //         serviceByModel[0].mrp = price

//     //     } else if (updateType) { // labour, parts
//     //         // businessFunctions.updateServicePrices(price, serviceByModel[0], updateType, item, serviceType)
//     //         updateServicePrices(price, serviceByModel[0], updateType, item, serviceType)
//     //     }
//     // }
//     // serviceByModel[0].markModified('tax_info');
//     // serviceByModel[0].save()


//     // res.status(200).json({
//     //     car: serviceByModel
//     // })

// })


module.exports = router