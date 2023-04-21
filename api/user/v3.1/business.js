var mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router(),
    config = require('./../../config'),
    bcrypt = require('bcrypt-nodejs'),
    assert = require('assert'),
    jwt = require('jsonwebtoken'),
    aws = require('aws-sdk'),
    multerS3 = require('multer-s3'),
    uuidv1 = require('uuid/v1'),
    Validator = require('validatorjs'),
    multer = require('multer'),
    moment = require('moment-timezone'),
    request = require('request');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});


const xAccessToken = require('../../middlewares/xAccessTokenBusiness');
const common = require('../../api/v3.1/common');
const fun = require('../../api/v3.1/function');
const event = require('../../api/v3.1/event');

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
const Booking = require('../../models/booking');
const Lead = require('../../models/lead');
const Service = require('../../models/service');
const Customization = require('../../models/customization');
const Collision = require('../../models/collision');
const Washing = require('../../models/washing');
const Product = require('../../models/product');
const LeadRemark = require('../../models/leadRemark');
const LeadStatus = require('../../models/leadStatus');
const Package = require('../../models/package');
const UserPackage = require('../../models/userPackage');
const Management = require('../../models/management');
const LeadManagement = require('../../models/leadManagement');
const ActivityLog = require('../../models/activityLog');
const Address = require('../../models/address');
const Gallery = require('../../models/gallery');
const Coupon = require('../../models/coupon');
const Detailing = require('../../models/detailing');


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

                            res.status(200).json({
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

/**
    * [Add Car Owner API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/owner/add', async function (req, res, next) {
    if (req.body.user) {
        var user = await User.findOne({ _id: req.body.user }).exec();
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                user: user.username,
                contact_no: user.contact_no
            },
        });
    }
    else {
        var rules = {
            contact_no: 'required',
            name: 'required',
        };

        var validation = new Validator(req.body, rules);

        if (validation.fails()) {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Mobile No. and name is required",
                responseData: {
                    res: validation.errors.all()
                }
            })
        }
        else {
            var checkPhone = await User.find({ contact_no: req.body.contact_no }).count().exec();
            if (checkPhone == 0) {
                var otp = Math.floor(Math.random() * 90000) + 10000;
                req.body.username = req.body.name + "" + Math.floor(Math.random() * 90000) + 10000;
                req.body.socialite = "";
                req.body.optional_info = "";

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

                req.body.business_info = {};

                User.create(req.body).then(async function (user) {
                    event.otpSms(user);
                    event.registrationSms(user);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "success",
                        responseData: {
                            _id: user._id,
                            id: user._id,
                            name: user.name,
                            email: user.email,
                            user: user.username,
                            contact_no: user.contact_no
                        },
                    });

                }).catch(next);
            }
        }
    }
});

/**
    * [Add Owner Car  API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/owner/car/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];

    var currentDate = new Date();
    var booking = null;
    var user = await User.findOne({ _id: req.body.user }).exec();


    if (user) {
        if (req.body.car) {
            var checkCar = await Car.findOne({ _id: req.body.car, user: user._id }).exec();
            if (checkCar) {
                Car.findOneAndUpdate({ _id: checkCar._id }, { $set: { mileage: req.body.mileage } }, { new: false }, function (err, doc) { })
                if (req.body.booking) {
                    var payment = {
                        payment_mode: "Undefined",
                        payment_status: "Pending",
                        discount_type: "",
                        coupon: "",
                        coupon_type: "",
                        discount: 0,
                        discount_total: 0,
                        part_cost: 0,
                        labour_cost: 0,
                        paid_total: 0,
                        total: 0,
                        discount_applied: false,
                        transaction_id: "",
                        transaction_date: "",
                        transaction_status: "",
                        transaction_response: ""
                    };

                    var bookingData = {
                        package: null,
                        car: checkCar._id,
                        advisor: decoded.user,
                        manager: null,
                        business: business,
                        user: user._id,
                        mileage: req.body.mileage,
                        services: [],
                        customer_requirements: {},
                        booking_no: Math.round(+new Date() / 1000),
                        date: new Date(),
                        time_slot: "N/a",
                        convenience: "N/a",
                        status: "Assigned",
                        estimation_requested: false,
                        payment: payment,
                        address: null,
                        lead: null,
                        is_services: true,
                        created_at: new Date(),
                        updated_at: new Date()
                    };

                    Booking.create(bookingData).then(async function (b) {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Car has been added",
                            responseData: {
                                car: checkCar._id,
                                user: user._id,
                                booking: b._id
                            }
                        });
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Car has been added",
                        responseData: {
                            car: checkCar._id,
                            user: user._id,
                            booking: booking
                        }
                    });
                }
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Someone already has this registration no",
                    responseData: {}
                });
            }
        }
        else {
            //var variant = await Variant.findOne({_id:req.body.variant}).populate('model').select('-service_schedule').exec();
            var checkCar = await Car.findOne({ registration_no: req.body.registration_no }).exec();
            if (!checkCar) {
                var variant = await Variant.findOne({ _id: req.body.variant }).populate('model').select('-service_schedule').exec();
                if (variant != null && variant) {
                    var count = await Car.find({}).count().exec();

                    req.body.geometry = [0, 0];

                    req.body.created_at = currentDate;
                    req.body.updated_at = currentDate;
                    req.body.mileage = req.body.mileage;
                    req.body.title = variant.variant;
                    req.body.automaker = variant.model.automaker;
                    req.body.model = variant.model._id;
                    req.body.user = user._id;
                    req.body.fuel_type = variant.specification.fuel_type;
                    req.body.transmission = variant.specification.type;
                    req.body.carId = Math.round(+new Date() / 1000),

                        await Car.create(req.body).then(async function (car) {
                            fun.addMember(user._id, variant.model);

                            if (req.body.booking == true) {
                                var payment = {
                                    payment_mode: "Undefined",
                                    payment_status: "Pending",
                                    discount_type: "",
                                    coupon: "",
                                    coupon_type: "",
                                    discount: 0,
                                    discount_total: 0,
                                    part_cost: 0,
                                    labour_cost: 0,
                                    paid_total: 0,
                                    total: 0,
                                    discount_applied: false,
                                    transaction_id: "",
                                    transaction_date: "",
                                    transaction_status: "",
                                    transaction_response: ""
                                };

                                var bookingData = {
                                    package: null,
                                    car: car._id,
                                    advisor: decoded.user,
                                    manager: null,
                                    business: business,
                                    user: user._id,
                                    services: [],
                                    customer_requirements: {},
                                    booking_no: Math.round(+new Date() / 1000),
                                    date: new Date(),
                                    time_slot: "N/a",
                                    convenience: "N/a",
                                    status: "Assigned",
                                    mileage: req.body.mileage,
                                    estimation_requested: false,
                                    payment: payment,
                                    address: null,
                                    lead: null,
                                    is_services: true,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                };


                                Booking.create(bookingData).then(async function (b) {
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Car has been added",
                                        responseData: {
                                            car: car._id,
                                            user: user._id,
                                            booking: b._id
                                        }
                                    });
                                });
                            }
                            else {
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "Car has been added",
                                    responseData: {
                                        car: car._id,
                                        user: user._id,
                                        booking: booking
                                    }
                                });
                            }
                        }).catch(next);
                }
                else {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Unprocessable Entity",
                        responseData: {}
                    });
                }
            }
            else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Someone already has this registration no",
                    responseData: {}
                });
            }
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        });
    }
});/**
    * [Add Owner Car  API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

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
                    var countType = await User.findOne({ contact_no: req.body.contact_no, 'account_info.type': 'business' }).count().exec();
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
    * [signup API]
    * @param  {[raw json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/management/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

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
                        var otp = Math.floor(Math.random() * 90000) + 10000;
                        var password = Math.floor(Math.random() * 90000) + 10000;

                        req.body.socialite = "";
                        req.body.optional_info = "";

                        var country = await Country.findOne({ timezone: req.headers['tz'] }).exec();
                        req.body.address = {
                            country: country.countryName,
                            timezone: req.headers['tz'],
                            location: req.body.location,
                        };

                        req.body.account_info = {
                            type: "management",
                            status: "Complete",
                            phone_verified: false,
                            verified_account: false,
                            approved_by_admin: false,
                        };

                        req.body.geometry = [0, 0];
                        req.body.password = password;
                        req.body.device = [];
                        req.body.otp = otp;
                        req.body.visibility = false


                        req.body.business_info = {
                            business_category: '',
                            company: ''
                        };

                        User.create(req.body).then(async function (user) {
                            Management.create({
                                business: decoded.user,
                                user: user._id,
                                created_at: new Date(),
                                updated_at: new Date()
                            });

                            event.otpSms(user);

                            res.status(200).json({
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

/**
    * [Get Estimation]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/estimation/get', xAccessToken.token, async function (req, res, next) {
    var car = await Variant.findOne({ _id: req.body.id }).exec();
    // console.log(car.model)
    var packages = [];
    if (car) {
        if (req.body.type == "services") {
            if (car.specification.fuel_type == "Petrol" || car.specification.fuel_type == "Diesel") {
                await Service.find({ model: car.model, fuel_type: car.specification.fuel_type })
                    .cursor().eachAsync(async (service) => {
                        var labour_cost = service.labour_cost;

                        var serviceName = service.service;
                        if (service.mileage) {
                            var serviceName = service.service + " (" + service.mileage + " KM)"
                        }

                        packages.push({
                            automaker: service.automaker,
                            model: service.model,
                            for: service.for,
                            package: service.package,
                            service: serviceName,
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
                    var labour_cost = service.labour_cost;

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
                    var labour_cost = service.labour_cost;
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
                        var labour_cost = service.labour_cost;

                        var serviceName = service.service;
                        if (service.mileage) {
                            var serviceName = service.service + " (" + service.mileage + " KM)"
                        }

                        packages.push({
                            automaker: service.automaker,
                            model: service.model,
                            for: service.for,
                            package: service.package,
                            service: serviceName,
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
                    var labour_cost = service.labour_cost;
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
                    var labour_cost = service.labour_cost;
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
            await Collision.find({ model: car.model }).cursor().eachAsync(async (service) => {

                var labour_cost = service.labour_cost;
                packages.push({
                    model: service.model,
                    model_name: service.model_name,
                    service: service.service,
                    icon: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/icon/" + _.camelCase(service.service) + ".png",
                    description: service.description,
                    mrp: Math.ceil(service.mrp),
                    labour_cost: Math.ceil(labour_cost),
                    part_cost: Math.ceil(service.part_cost),
                    cost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                    originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                    package: service.package,
                    paint: service.paint,
                    id: service.id,
                    doorstep: service.doorstep,
                    type: "collision",
                    _id: service._id
                })
            });

            packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

            packageDiscountOn = []
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Collision",
                responseData: packages
            });
        }
        else if (req.body.type == "detailing") {
            await Detailing.find({ model: car.model }).cursor().eachAsync(async (service) => {

                var labour_cost = service.labour_cost;
                packages.push({
                    model: service.model,
                    model_name: service.model_name,
                    service: service.service,
                    icon: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/icon/" + _.camelCase(service.service) + ".png",
                    description: service.description,
                    mrp: Math.ceil(service.mrp),
                    labour_cost: Math.ceil(labour_cost),
                    part_cost: Math.ceil(service.part_cost),
                    cost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                    originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                    package: service.package,
                    id: service.id,
                    doorstep: service.doorstep,
                    type: "collision",
                    _id: service._id
                })
            });

            packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

            packageDiscountOn = []
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Collision",
                responseData: packages
            });
        }
        else if (req.body.type == "washing") {
            await Washing.find({ model: car.model }).cursor().eachAsync(async (service) => {
                var labour_cost = service.labour_cost;

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
                    id: service.id,
                    doorstep: service.doorstep,
                    _id: service._id
                });

            });
            await Package.find({ category: "washing" }).cursor().eachAsync(async (service) => {
                var labour_cost = service.labour_cost;
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

        else if (req.body.type == "customization") {
            await Customization.find({ model: car.model }).cursor().eachAsync(async (service) => {
                var labour_cost = service.labour_cost;

                packages.push({
                    automaker: service.automaker,
                    brand: service.brand,
                    service: service.service,
                    description: service.description,
                    mrp: Math.ceil(service.mrp),
                    labour_cost: Math.ceil(labour_cost),
                    part_cost: Math.ceil(service.part_cost),
                    cost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                    originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                    type: "washing",
                    package: service.package,
                    id: service.id,
                    doorstep: service.doorstep,
                    _id: service._id
                });

            });

            packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

            packageDiscountOn = []
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Washing",
                responseData: packages
            });
        }
        else if (req.body.type == "product") {
            await Product.find({ is_common: true }).cursor().eachAsync(async (service) => {
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
                    mrp: Math.ceil(service.mrp),
                    labour_cost: Math.ceil(service.labour_cost),
                    part_cost: Math.ceil(service.part_cost),
                    cost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                    originalCost: Math.ceil(service.part_cost) + Math.ceil(service.labour_cost),
                    is_common: service.is_common,
                    inclusions: service.inclusions,
                    fuel_type: service.fuel_type,
                    doorstep: service.doorstep,
                    type: "product",
                    id: service.id,
                    _id: service._id
                });
            });

            packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Package",
                responseData: packages
            });
        }
        else if (req.body.type == "package") {
            await Package.find({ label: "special" }).cursor().eachAsync(async (service) => {
                var serverTime = moment.tz(new Date(), req.headers['tz']);
                var bar = moment.tz(service.expired_at, req.headers['tz']);
                var baz = bar.diff(serverTime);
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
                responseMessage: "Package",
                responseData: packages
            });
        }
    }
});

/**
    * [Leads]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/chat/leads/add', async function (req, res, next) {
    var user = await User.findById(req.query.id).exec();
    if (user) {
        var data = new Object();

        var status = await LeadStatus.findOne({ status: "Open" }).exec();
        var manager = null;

        var status = await LeadStatus.findOne({ status: "Open" }).exec();

        var managers = [];
        await LeadManagement.find({ business: "5bfec47ef651033d1c99fbca", source: "Chat" })
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

        data.user = user._id;
        data.name = user.name;
        data.contact_no = user.contact_no;
        data.email = user.email;
        data.assignee = manager;
        data.type = req.query.type;
        data.geometry = [0, 0],
            data.remark = {
                status: status.status,
                customer_remark: req.body.remark,
                assignee_remark: '',
                color_code: status.color_code,
                created_at: new Date(),
                updated_at: new Date()
            };

        data.business = "5bfec47ef651033d1c99fbca";
        data.source = req.headers['devicetype'];
        data.created_at = new Date();
        data.updated_at = new Date();

        var leads = {};
        var check = await Lead.find({ user: user._id, type: req.query.type }).count().exec();
        if (check == 0) {
            Lead.create(data).then(async function (lead) {

                var leads = {
                    user: lead.user,
                    name: lead.name,
                    contact_no: lead.contact_no,
                    email: lead.email,
                    _id: lead._id,
                    id: lead.id,
                    type: lead.type,
                    date: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                    status: lead.status,
                    created_at: lead.created_at,
                    updated_at: lead.updated_at,
                    remark: lead.remark
                };

                event.zohoLead(lead, manager)

                var json = ({
                    responseCode: 200,
                    responseMessage: "Lead Added",
                    responseData: leads
                });
                res.status(200).json(json)
            });
        }
        else {
            var lead = await Lead.findOne({ user: user._id, type: req.query.type }).exec();



            bar = moment.tz(bar, req.headers['tz'])
            var serverTime = moment.tz(new Date(), req.headers['tz']);
            var bar = lead.updated_at;
            var baz = serverTime.diff(bar);

            var diff = (baz / (60 * 60 * 24 * 1000))

            // console.log(diff)

            if (diff >= 2) {
                Lead.findOneAndUpdate({ user: user._id, type: req.query.type }, { $set: { updated_at: new Date() } }, { new: true }, async function (err, doc) { });
            }

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Lead Added",
                responseData: {}
            });
        }
    }
    else {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "User Not Found",
            responseData: {}
        });
    }
});

/**
    * [Add Lead]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/lead/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var data = {}
    var status = await LeadStatus.findOne({ status: req.body.status }).exec();
    var follow_up = {};
    if (status.status == "Follow-Up") {
        var follow_up = {
            date: new Date(req.body.date).toISOString(),
            created_at: new Date(),
            updated_at: new Date()
        }
    }
    data.user = null;
    data.name = req.body.name;
    data.contact_no = req.body.contact_no;
    data.email = req.body.email;
    data.type = req.body.source;
    data.geometry = [0, 0],
        data.remark = {
            status: status.status,
            customer_remark: req.body.customer_remark,
            assignee_remark: req.body.assignee_remark,
            color_code: status.color_code,
            created_at: new Date(),
            updated_at: new Date()
        };
    data.follow_up = follow_up;
    data.business = req.headers['business'],
        data.assignee = decoded.user,
        data.source = req.body.source;
    data.created_at = new Date();
    data.updated_at = new Date();

    var leads = {};

    await Lead.create(data).then(async function (lead) {
        // event.leadCre(lead._id, lead.business);
        LeadRemark.create({
            lead: lead._id,
            status: status.status,
            customer_remark: req.body.customer_remark,
            assignee_remark: req.body.assignee_remark,
            assignee: decoded.user,
            color_code: status.color_code,
            created_at: new Date(),
            updated_at: new Date()
        });

        var leads = {
            user: lead.user,
            name: lead.name,
            contact_no: lead.contact_no,
            email: lead.email,
            _id: lead._id,
            id: lead.id,
            type: lead.type,
            date: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
            status: lead.status,
            created_at: lead.created_at,
            updated_at: lead.updated_at,
            remark: lead.remark
        };

        //event.zohoLead(lead)

        var json = ({
            responseCode: 200,
            responseMessage: "Lead Added",
            responseData: leads
        });
        res.status(200).json(json)
    });
});

/**
    * [Lead Edit]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.put('/lead/edit', xAccessToken.token, async function (req, res, next) {
    // console.log("  fvf " + req.body.id)
    var lead = await Lead.findById(req.body.id).exec();
    if (lead) {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

        var data = {}
        var follow_up = {};

        data.user = req.body.user;
        data.name = req.body.name;
        data.contact_no = req.body.contact_no;
        data.email = req.body.email;

        data.created_at = lead.created_at;
        data.updated_at = new Date();

        var leads = {};
        // console.log("Datat " + req.body.name)
        Lead.findOneAndUpdate({ _id: lead._id }, { $set: data }, { new: true }, async function (err, doc) {
            var lead = await Lead.findById(req.body.id).exec();
            var leads = {
                user: lead.user,
                name: lead.name,
                contact_no: lead.contact_no,
                email: lead.email,
                _id: lead._id,
                id: lead.id,
                type: lead.type,
                date: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                status: lead.status,
                created_at: lead.created_at,
                updated_at: lead.updated_at,
                remark: lead.remark
            };

            //event.zohoLead(lead)

            var json = ({
                responseCode: 200,
                responseMessage: "Lead Added",
                responseData: leads
            });
            res.status(200).json(json)
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Lead not found",
            responseData: {}
        });
    }
});

/**
    * [Leads]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/leads/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;

    var role = await Management.findOne({ user: user, business: business }).exec();
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var leads = [];
    var queries = {};

    if (role.role == "CRE") {
        if (req.query.status) {
            if (!req.query.search) {
                queries = {
                    "remark.status": req.query.status,
                    assignee: user,
                }
            }
            else {

                queries = {
                    assignee: user,
                    "remark.status": req.query.status,
                    $or: [
                        { 'name': { $regex: new RegExp(req.query.search, 'i') } },
                        { 'contact_no': { $regex: new RegExp(req.query.search, 'i') } }
                    ]
                }

            }
        }
        else if (req.query.search) {
            if (!req.query.status) {
                queries = {
                    assignee: user,
                    $or: [
                        { 'name': { $regex: new RegExp(req.query.search, 'i') } },
                        { 'contact_no': { $regex: new RegExp(req.query.search, 'i') } }
                    ]
                }
            }
            else {

                queries = {
                    assignee: user,
                    "remark.status": req.query.status,
                    $or: [
                        { 'name': { $regex: new RegExp(req.query.search, 'i') } },
                        { 'contact_no': { $regex: new RegExp(req.query.search, 'i') } }
                    ]
                }

            }
        }
    }
    else if (role.role == "Admin") {
        if (req.query.status) {
            if (!req.query.search) {
                queries = {
                    "remark.status": req.query.status,
                    business: business,
                }
            }
            else {


                queries = {
                    business: business,
                    "remark.status": req.query.status,
                    $or: [
                        { 'name': { $regex: new RegExp(req.query.search, 'i') } },
                        { 'contact_no': { $regex: new RegExp(req.query.search, 'i') } }
                    ]
                }

            }
        }
        else if (req.query.search) {
            if (!req.query.status) {
                queries = {
                    business: business,
                    $or: [
                        { 'name': { $regex: new RegExp(req.query.search, 'i') } },
                        { 'contact_no': { $regex: new RegExp(req.query.search, 'i') } }
                    ]
                }
            }
            else {

                queries = {
                    business: business,
                    "remark.status": req.query.status,
                    $or: [
                        { 'name': { $regex: new RegExp(req.query.search, 'i') } },
                        { 'contact_no': { $regex: new RegExp(req.query.search, 'i') } }
                    ]
                }

            }
        }
    }
    else {
        res.status(401).json({
            responseCode: 401,
            responseMessage: "Unauthorized",
            responseData: role,
            responseInfo: {
            }
        });
    }

    // console.log(queries)
    var totalResult = await Lead.find(queries).count().exec();

    await Lead.find(queries)
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

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: leads,
        responseInfo: {
            totalResult: totalResult
        }
    });
});


router.get('/follow-up/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;

    var role = await Management.findOne({ user: user, business: business }).exec();
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var leads = [];
    var queries = {};
    var dateString = new Date();
    dateString = new Date(dateString).toISOString();
    dateString = dateString.slice(0, 10);

    if (role.role == "CRE") {
        queries = {
            assignee: user,
            "follow_up.date": { $lte: new Date(dateString) },
        }

    }
    else if (role.role == "Admin") {
        queries = {
            business: business,
            "follow_up.date": { $lte: new Date(dateString) },
        }
    }
    else {
        res.status(401).json({
            responseCode: 401,
            responseMessage: "Unauthorized",
            responseData: {},
            responseInfo: {
            }
        });
    }

    // console.log(queries)
    var totalResult = await Lead.find(queries).count().exec();

    await Lead.find(queries)
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

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: leads,
        responseInfo: {
            totalResult: totalResult
        }
    });
});


/**
    * [Assign Lead]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/convert/lead', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];

    var estimation_requested = false;
    if (req.body.estimation_requested == "Yes") {
        estimation_requested = true;
    }


    var role = await Management.findOne({ user: user, business: business }).exec();
    if (role.role == "CRE") {
        var lead = await Lead.findOne({ assignee: user, _id: req.body.id }).exec();
    }
    else if (role.role == "Admin") {
        var lead = await Lead.findOne({ business: business, _id: req.body.id }).exec();
    }
    else {
        var lead = {}
    }


    if (lead) {
        var follow_up = {};
        var status = await LeadStatus.findOne({ status: req.body.status }).exec()

        var data = {
            updated_at: new Date(),
            remark: {
                lead: lead._id,
                status: status.status,
                color_code: status.color_code,
                assignee: lead.assignee,
                customer_remark: req.body.customer_remark,
                assignee_remark: req.body.assignee_remark,
                created_at: new Date(),
                updated_at: new Date(),
            },
            follow_up: follow_up
        };


        Lead.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
            LeadRemark.create({
                lead: lead._id,
                status: status.status,
                color_code: status.color_code,
                assignee: lead.assignee,
                customer_remark: req.body.customer_remark,
                assignee_remark: req.body.assignee_remark,
                created_at: new Date(),
                updated_at: new Date(),
            });

            var check = await User.findOne({ "contact_no": lead.contact_no }).exec();
            if (check) {
                var checkPreBooking = await Booking.findOne({ lead: lead._id }).exec();
                if (checkPreBooking) {
                    if (checkPreBooking.status == "Follow-Up") {
                        var data = {
                            updated_at: new Date(),
                            status: "Assigned"
                        };

                        Booking.findOneAndUpdate({ _id: checkPreBooking._id }, { $set: data }, { new: true }, async function (err, doc) {
                            if (err) {
                                var json = ({
                                    responseCode: 422,
                                    responseMessage: "Error occured",
                                    responseData: {}
                                });
                                res.status(422).json(json)
                            }
                            else {
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "Lead has been assigned",
                                    responseData: checkPreBooking._id
                                });
                            }
                        });
                    }
                    else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Lead has been already assigned.",
                            responseData: checkPreBooking._id
                        });
                    }
                }
                else {
                    var bookingService = [];
                    var customer_requirements = [];
                    var countBooking = await Booking.find({}).count().exec();

                    var advisorBooking = [];
                    await Management.find({ business: lead.business, role: "Service Advisor" })
                        .cursor().eachAsync(async (a) => {
                            var d = await Booking.find({ business: lead.business, advisor: a.user, status: { $in: ["EstimateRequested", "JobInitiated", "JobOpen", "In-Process", "StartWork", "Rework"] } }).count().exec();
                            advisorBooking.push({
                                user: a.user,
                                count: d
                            })
                        });

                    //res.json(advisorBooking)

                    if (advisorBooking.length != 0) {
                        advisorBooking.sort(function (a, b) {
                            return a.count > b.count;
                        });

                        var advisor = advisorBooking[0].user;
                    }
                    else {
                        var advisor = null
                    }


                    var payment = {
                        payment_mode: "Undefined",
                        payment_status: "Pending",
                        discount_type: "",
                        coupon: "",
                        coupon_type: "",
                        discount: 0,
                        discount_total: 0,
                        part_cost: 0,
                        labour_cost: 0,
                        paid_total: 0,
                        total: 0,
                        discount_applied: false,
                        transaction_id: "",
                        transaction_date: "",
                        transaction_status: "",
                        transaction_response: ""
                    }



                    var bookingData = {
                        package: null,
                        car: null,
                        advisor: advisor,
                        manager: lead.assignee,
                        business: lead.business,
                        user: check.id,
                        services: bookingService,
                        customer_requirements: {
                            requirement: req.body.customer_remark,
                        },
                        booking_no: Math.round(+new Date() / 1000) + Math.floor((Math.random() * 9999) + 1),
                        date: new Date(),
                        time_slot: "N/a",
                        convenience: "N/a",
                        status: "Assigned",
                        payment: payment,
                        address: null,
                        lead: lead._id,
                        estimation_requested: estimation_requested,
                        is_services: true,
                        created_at: new Date(),
                        updated_at: new Date()
                    };

                    Booking.create(bookingData).then(async function (booking) {
                        var notify = {
                            receiver: [booking.business],
                            activity: "booking",
                            tag: "assignedBooking",
                            source: booking._id,
                            sender: booking.user,
                            points: 0
                        }
                        fun.newNotification(notify);

                        if (booking.advisor) {
                            var notify = {
                                receiver: [booking.advisor],
                                activity: "booking",
                                tag: "assignedBooking",
                                source: booking._id,
                                sender: null,
                                points: 0
                            }

                            fun.newNotification(notify);
                        }

                        event.assignedBookingMail(booking._id);


                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Lead has been assigned",
                            responseData: booking._id
                        });
                    });
                }

            }
            else {
                var data = new Object();
                data.address = {
                    country: "India",
                    timezone: "Asia/Kolkata",
                    location: "",
                };

                data.account_info = {
                    type: "user",
                    status: "Complete",
                };

                var name = lead.name;
                var rand = Math.floor((Math.random() * 100000) + 1);

                data.username = name.substring(0, 3) + "" + shortid.generate();
                data.referral_code = name.substring(0, 3).toUpperCase() + "" + rand;
                data.geometry = [0, 0];
                data.device = [];
                data.otp = Math.floor(Math.random() * 90000) + 10000;
                data.careager_cash = 0;
                data.socialite = "";
                data.optional_info = "";
                data.business_info = "";
                data.name = lead.name;
                data.email = lead.email;
                data.optional_info = {};
                data.business_info = {};
                data.contact_no = lead.contact_no;


                // console.log(data)

                User.create(data).then(async function (newUser) {
                    var checkPreBooking = await Booking.find({ lead: lead._id }).count().exec();
                    if (checkPreBooking == 0) {
                        var bookingService = [];
                        var customer_requirements = [];
                        var countBooking = await Booking.find({}).count().exec();

                        var advisorBooking = [];
                        await Management.find({ business: lead.business, role: "Service Advisor" })
                            .cursor().eachAsync(async (a) => {
                                var d = await Booking.find({ business: lead.business, advisor: a.user }).count().exec();
                                advisorBooking.push({
                                    user: a.user,
                                    count: await Booking.find({ business: lead.business, advisor: a.user }).count().exec()
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

                        var payment = {
                            payment_mode: "Undefined",
                            payment_status: "Pending",
                            discount_type: "",
                            coupon: "",
                            coupon_type: "",
                            discount: 0,
                            discount_total: 0,
                            part_cost: 0,
                            labour_cost: 0,
                            paid_total: 0,
                            total: 0,
                            discount_applied: false,
                            transaction_id: "",
                            transaction_date: "",
                            transaction_status: "",
                            transaction_response: ""
                        };

                        var bookingData = {
                            package: null,
                            car: null,
                            advisor: advisor,
                            manager: lead.assignee,
                            business: lead.business,
                            user: newUser.id,
                            services: bookingService,
                            customer_requirements: {
                                requirement: lead.remark.customer_remark
                            },
                            booking_no: Math.round(+new Date() / 1000),
                            date: new Date(),
                            time_slot: "N/a",
                            convenience: "N/a",
                            status: "Assigned",
                            estimation_requested: estimation_requested,
                            payment: payment,
                            address: null,
                            lead: lead._id,
                            is_services: true,
                            created_at: new Date(),
                            updated_at: new Date()
                        };


                        Booking.create(bookingData).then(async function (booking) {
                            var notify = {
                                receiver: [booking.business],
                                activity: "booking",
                                tag: "assignedBooking",
                                source: booking._id,
                                sender: null,
                                points: 0
                            }
                            fun.newNotification(notify);

                            if (booking.advisor) {
                                var notify = {
                                    receiver: [booking.advisor],
                                    activity: "booking",
                                    tag: "assignedBooking",
                                    source: booking._id,
                                    sender: null,
                                    points: 0
                                }

                                fun.newNotification(notify);
                            }

                            event.assignedBookingMail(booking._id);
                            res.status(200).json({
                                responseCode: 200,
                                esponseMessage: "Lead has been assigned",
                                responseData: booking._id
                            });
                        });
                    }
                    else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Lead has been already assigned...",
                            responseData: {}
                        });
                    }
                }).catch(next);
            }
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Lead not found",
            responseData: {}
        });
    }
});

/**
    * [Lead Status Type]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/lead/status/get', xAccessToken.token, async function (req, res, next) {
    var leads = [];
    await LeadStatus.find({ show: true })
        .cursor().eachAsync(async (lead) => {
            if (lead) {
                var remark = await LeadRemark.findOne({ lead: lead._id }).sort({ created_at: -1 }).exec();
                leads.push({
                    id: lead.id,
                    color_code: lead.color_code,
                    status: lead.status,
                    is_follow_up: lead.is_follow_up,
                    show: lead.show,
                    count: await Lead.find({ "remark.status": lead.status }).count().exec()
                });
            }
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: leads
    });
});


/**
    * [Lead Status Type]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/lead/remarks/get', xAccessToken.token, async function (req, res, next) {
    var leads = [];
    await LeadRemark.find({ lead: req.query.id }).sort({ created_at: -1 })
        .cursor().eachAsync(async (lead) => {
            leads.push({
                lead: lead.lead,
                _id: lead._id,
                id: lead.id,
                color_code: lead.color_code,
                assignee_remark: lead.assignee_remark,
                customer_remark: lead.customer_remark,
                status: lead.status,
                created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: leads
    });
});

/*
    * [Lead Status Type]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.get('/lead/contact-history/get', xAccessToken.token, async function (req, res, next) {
    var leads = [];
    var leadId = [];

    await Lead.find({ contact_no: req.query.contact_no }).sort({ created_at: -1 })
        .cursor().eachAsync(async (l) => {
            leadId.push(l._id);
        });


    leadId = Array.from(new Set(leadId));

    await LeadRemark.find({ lead: { $in: leadId } })
        .populate({ path: 'assignee', select: 'name username avatar avatar_address' })
        .sort({ created_at: -1 })
        .cursor().eachAsync(async (lead) => {
            leads.push({
                lead: lead.lead,
                _id: lead._id,
                id: lead.id,
                color_code: lead.color_code,
                assignee: lead.assignee,
                assignee_remark: lead.assignee_remark,
                customer_remark: lead.customer_remark,
                status: lead.status,
                created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: leads
    });
});

/**
    * [Lead Status Type]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.put('/lead/important', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Label required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var data = {};
        var status = await Lead.findOne({ _id: req.body.id }).exec()
        if (status.important == true) {
            data = {
                important: false,
                updated_at: new Date()
            };
        }
        else {
            data = {
                important: true,
                updated_at: new Date()
            };
        }

        Lead.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: data
            })
        });
    }
});

/**
    * [List product categories]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/remark/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var rules = {
        id: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Label required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var role = await Management.findOne({ user: user, business: business }).exec();
        if (role.role == "CRE") {
            var check = await Lead.findOne({ business: business, _id: req.body.id }).exec();
        }
        else if (role.role == "Admin") {
            var check = await Lead.findOne({ business: business, _id: req.body.id }).exec();
        }
        else {
            var check = {}
        }

        if (check) {
            var data = {};
            var follow_up = {};
            var status = await LeadStatus.findOne({ status: req.body.status }).exec()
            if (status.status == "Follow-Up") {
                var follow_up = {
                    date: new Date(req.body.date).toISOString(),
                    created_at: new Date(),
                    updated_at: new Date()
                }
            }
            data = {
                updated_at: new Date(),
                remark: {
                    lead: check._id,
                    status: status.status,
                    color_code: status.color_code,
                    assignee: check.assignee,
                    customer_remark: req.body.customer_remark,
                    assignee_remark: req.body.assignee_remark,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                follow_up: follow_up
            };

            Lead.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
                data.remark.lead = req.body.id;
                data.created_at = new Date();
                LeadRemark.create(data.remark);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: await Lead.findOne({ _id: req.body.id }).exec()
                })
            });
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {
                }
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

router.get('/user/search', xAccessToken.token, async function (req, res, next) {
    var rules = {
        query: 'required',
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
        var business = req.headers['business'];
        var peoples = [];

        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));

        var query = req.query.query;


        await User.find({ 'account_info.type': 'user' })
            .or([{
                $or: [
                    { 'name': { $regex: new RegExp(query, 'i') } },
                    { 'contact_no': { $regex: new RegExp(query, 'i') } }
                ]
            },
            ])
            .select('name username avatar avatar_address contact_no email careager_cash account_info')
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
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                    joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                });

            });


        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: peoples,
        });
    }
});
/**
 * [Expore Search]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/user/details', xAccessToken.token, async function (req, res, next) {
    var rules = {
        query: 'required',
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
        var business = req.headers['business'];
        var peoples = [];

        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));

        var query = req.query.query;


        await User.find({ '_id': req.query.query, 'account_info.type': 'user' })
            .select('name username avatar avatar_address contact_no email careager_cash account_info')
            .sort({ created_at: -1 }).limit(config.perPage)
            .skip(config.perPage * page)
            .cursor().eachAsync(async (user) => {
                var date = new Date();
                date.setDate(date.getDate() - 1);
                var bookings = []
                await Booking.find({
                    user: user._id,
                    business: business,
                    status: { $ne: "Inactive" },
                    is_services: true
                })
                    .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
                    .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
                    .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
                    .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })
                    .populate({ path: 'car', select: '_id id title registration_no ic rc' })
                    .sort({ date: 1 })
                    .cursor().eachAsync(async (booking) => {
                        var car = null;
                        var manager = null;
                        var advisor = null;
                        var address = null;
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
                                email: booking.user.email
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
                            status: booking.status,
                            booking_no: booking.booking_no,
                            estimation_requested: booking.estimation_requested,
                            address: address,
                            payment: booking.payment,
                            due: booking.due,
                            __v: booking.__v,
                            updated_at: booking.updated_at,
                            updated_at: booking.updated_at,
                        });
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

                var leadId = [];
                var leads = [];
                await Lead.find({ contact_no: user.contact_no }).sort({ created_at: -1 })
                    .cursor().eachAsync(async (l) => {
                        leadId.push(l._id);
                    });


                leadId = Array.from(new Set(leadId));

                await LeadRemark.find({ lead: { $in: leadId } })
                    .populate({ path: 'assignee', select: 'name username avatar avatar_address' })
                    .sort({ created_at: -1 })
                    .cursor().eachAsync(async (lead) => {
                        leads.push({
                            lead: lead.lead,
                            _id: lead._id,
                            id: lead.id,
                            color_code: lead.color_code,
                            assignee: lead.assignee,
                            assignee_remark: lead.assignee_remark,
                            customer_remark: lead.customer_remark,
                            status: lead.status,
                            created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                            updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                        });
                    });

                peoples = {
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    contact_no: user.contact_no,
                    avatar_address: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/avatar/" + user.avatar,
                    account_info: user.account_info,
                    careager_cash: user.careager_cash,
                    cars: cars,
                    bookings: bookings,
                    leads: leads,
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
    }
});

/*
 * [Bookings API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.post('/booking/add', async function (req, res, next) {
    var rules = {
        name: 'required',
        contact_no: 'required',
        email: 'required',
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
        var check = await User.findOne({ contact_no: req.body.contact_no }).exec();
        if (check) {
            var bookingService = [];
            var customer_requirements = [];
            var countBooking = await Booking.find({}).count().exec();

            customer_requirements.push({
                requirements: req.body.description,
            });

            if (req.body.description) {
                customer_requirements.push({
                    requirement: req.body.descriptions,
                });
            }

            var advisorBooking = [];
            await Management.find({ business: "5bfec47ef651033d1c99fbca", role: "Service Advisor" })
                .cursor().eachAsync(async (a) => {
                    var d = await Booking.find({ business: "5bfec47ef651033d1c99fbca", advisor: a.user }).count().exec();
                    advisorBooking.push({
                        user: a.user,
                        count: d
                    })
                });

            //res.json(advisorBooking)

            if (advisorBooking.length != 0) {
                advisorBooking.sort(function (a, b) {
                    return a.count > b.count;
                });

                var advisor = advisorBooking[0].user;
            }
            else {
                var advisor = null
            }

            var payment = {
                payment_mode: "Undefined",
                payment_status: "Pending",
                discount_type: "",
                coupon: "",
                coupon_type: "",
                discount: 0,
                discount_total: 0,
                part_cost: 0,
                labour_cost: 0,
                paid_total: 0,
                total: 0,
                discount_applied: false,
                transaction_id: "",
                transaction_date: "",
                transaction_status: "",
                transaction_response: ""
            }

            var bookingData = {
                package: null,
                car: null,
                advisor: advisor,
                business: "5bfec47ef651033d1c99fbca",
                user: check.id,
                services: bookingService,
                customer_requirements: customer_requirements,
                booking_no: Math.round(+new Date() / 1000),
                date: new Date(),
                time_slot: "N/a",
                convenience: "N/a",
                status: "Assigned",
                payment: payment,
                address: null,
                lead: req.body.lead_id,
                is_services: true,
                created_at: new Date(),
                updated_at: new Date()
            };


            Booking.create(bookingData).then(async function (booking) {
                event.assignedBookingMail(booking._id);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Assigned",
                    responseData: booking._id
                });

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Assigned",
                    responseData: booking
                });
            });
        }
        else {
            var data = new Object();
            data.address = {
                country: "India",
                timezone: "Asia/Kolkata",
                location: "",
            };

            data.account_info = {
                type: "user",
                status: "Complete",
            };

            var name = req.body.first_name.substring(0, 3);
            var rand = Math.floor((Math.random() * 100000) + 1);


            data.username = name + "" + shortid.generate();
            data.referral_code = name.toUpperCase() + "" + rand;
            data.geometry = [0, 0];
            data.device = [];
            data.otp = Math.floor(Math.random() * 90000) + 10000;
            data.careager_cash = 0;
            data.socialite = "";
            data.optional_info = "";
            data.business_info = "";
            data.name = req.body.first_name + " " + req.body.last_name;
            data.email = req.body.email;
            data.contact_no = req.body.contact_no;


            User.create(data).then(async function (user) {
                //event.otpSms(user);

                var bookingService = [];
                var customer_remark = [];
                var countBooking = await Booking.find({}).count().exec();

                if (req.body.description) {
                    customer_requirements.push({
                        remark: req.body.description,
                    });
                }

                var advisorBooking = [];
                await Management.find({ business: "5bfec47ef651033d1c99fbca", role: "Service Advisor" })
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

                var payment = {
                    payment_mode: "Undefined",
                    payment_status: "Pending",
                    discount_type: "",
                    coupon: "",
                    coupon_type: "",
                    discount: 0,
                    discount_total: 0,
                    part_cost: 0,
                    labour_cost: 0,
                    paid_total: 0,
                    total: 0,
                    discount_applied: false,
                    transaction_id: "",
                    transaction_date: "",
                    transaction_status: "",
                    transaction_response: ""
                }

                var bookingData = {
                    package: null,
                    car: null,
                    advisor: advisor,
                    business: "5bfec47ef651033d1c99fbca",
                    user: user.id,
                    services: bookingService,
                    customer_remark: customer_remark,
                    booking_no: Math.round(+new Date() / 1000) + Math.floor((Math.random() * 9999) + 1),
                    date: new Date(),
                    time_slot: "N/a",
                    convenience: "N/a",
                    status: "Assigned",
                    payment: payment,
                    address: null,
                    lead: req.body.lead_id,
                    is_services: true,
                    created_at: new Date(),
                    updated_at: new Date()
                };


                Booking.create(bookingData).then(async function (booking) {
                    event.assignedBookingMail(booking._id);
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Assigned",
                        responseData: booking._id
                    });
                });

            }).catch(next);
        }
    }
});


router.put('/booking/rework', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Lead required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var booking = await Booking.findOne({ lead: req.body.id }).exec();
        if (booking) {
            var data = {
                is_rework: true,
                is_reviewed: false,
                updated_at: new Date()
            }
            Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: true }, async function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 422,
                        responseMessage: "Error occured",
                        responseData: {}
                    });
                    res.status(422).json(json)
                }
                else {
                    event.assignedBookingMail(booking._id);
                    var notify = {
                        receiver: [booking.business],
                        activity: "booking",
                        tag: "rework",
                        source: booking._id,
                        sender: booking.user,
                        points: 0
                    }

                    fun.newNotification(notify);

                    if (booking.advisor) {
                        var notify = {
                            receiver: [booking.advisor],
                            activity: "booking",
                            tag: "rework",
                            source: booking._id,
                            sender: booking.user,
                            points: 0
                        }
                        fun.newNotification(notify);
                    }

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Assigned",
                        responseData: booking._id
                    });
                }
            });
        }
        else {
            var json = ({
                responseCode: 400,
                responseMessage: "Error occured",
                responseData: {}
            });
            res.status(400).json(json)
        }
    }
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
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;

    var role = await Management.findOne({ user: user, business: business }).exec();
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var queries = new Object();
    var sortBy = new Object();

    if (role.role == "Service Advisor") {
        if (req.query.status) {
            if (req.query.status == "Missed") {
                date = new Date()

                var to = new Date(date - 24 * 60 * 60 * 1000);
                to.setDate(date.getDate() - 1);
                to.setHours(23, 59, 59)

                queries = {
                    advisor: user,
                    business: business,
                    status: { $ne: "Inactive" },
                    $and: [
                        {
                            status: { $ne: "Rejected" }
                        },
                        {
                            status: { $ne: "Cancelled" }
                        },
                        {
                            status: { $ne: "Completed" }
                        },
                        {
                            status: { $ne: "Assigned" }
                        }
                    ],
                    is_services: true,
                    date: { "$lte": to }
                };
                sortBy = { date: 1 }
            }
            else if (req.query.status == "Rework") {
                queries = {
                    is_rework: true
                };
                sortBy = { updated_at: -1 }
            }
            else {
                if (req.query.sortBy) {
                    if (req.query.sortBy == "date") {
                        var date = new Date();
                        date.setDate(date.getDate() - 1);
                        queries = {
                            advisor: user,
                            business: business,
                            status: req.query.status,
                            is_services: true,
                            date: { "$gte": date }
                        };
                        sortBy = { date: 1 }
                    }
                }
                else {
                    queries = {
                        advisor: user,
                        business: business,
                        status: req.query.status,
                        is_services: true,
                    }
                    sortBy = { updated_at: -1 }
                }
            }
        }
        else {
            if (req.query.sortBy) {
                if (req.query.sortBy == "date") {
                    var date = new Date();
                    date.setDate(date.getDate() - 1);

                    queries = {
                        advisor: user,
                        business: business,
                        status: { $ne: "Inactive" },
                        $and: [
                            {
                                status: { $ne: "Rejected" }
                            },
                            {
                                status: { $ne: "Cancelled" }
                            },
                            {
                                status: { $ne: "Completed" }
                            },
                            {
                                status: { $ne: "Assigned" }
                            }
                        ],
                        is_services: true,
                        date: { "$gte": date }
                    };
                    sortBy = { date: 1 }
                }
            }
            else {
                queries = {
                    status: { $ne: "Inactive" },
                    advisor: user,
                    business: business,
                    is_services: true,
                }
                sortBy = { updated_at: -1 }
            }
        }

        var thumbnail = []

        totalResult = await Booking.find(queries).count().exec();

        await Booking.find(queries)
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
            .sort(sortBy).skip(config.perPage * page).limit(config.perPage)
            .cursor().eachAsync(async (booking) => {
                if (booking.status == "Pending" || booking.status == "Confirmed" || booking.status == "Completed" || booking.status == "Approval" || booking.status == "Rejected" || booking.status == "Approved" || booking.is_rework == true) {
                    if (booking.address) {
                        var address = await Address.findOne({ _id: booking.address }).exec();
                    }
                    else {
                        var address = {};
                    }
                    if (booking.car) {
                        var car = {
                            title: booking.car.title,
                            _id: booking.car._id,
                            id: booking.car.id,
                            rc_address: booking.car.rc_address,
                            ic_address: booking.car.ic_address,
                            ic: booking.car.ic,
                            rc: booking.car.rc,
                            registration_no: booking.car.registration_no,
                        }
                    }
                    else {
                        var car = {
                            title: "",
                            _id: null,
                            id: null,
                            rc_address: "",
                            ic_address: "",
                            ic: "",
                            rc: "",
                            registration_no: "",
                        }

                    }
                    bookings.push({
                        _id: booking._id,
                        id: booking._id,
                        car: car,
                        user: {
                            name: booking.user.name,
                            _id: booking.user._id,
                            id: booking.user.id,
                            contact_no: booking.user.contact_no
                        },
                        manager: booking.manager,
                        services: booking.services,
                        convenience: booking.convenience,
                        date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                        time_slot: booking.time_slot,
                        status: booking.status,
                        booking_no: booking.booking_no,
                        estimation_requested: booking.estimation_requested,
                        customer_requirements: booking.customer_requirements,
                        address: address,
                        payment: booking.payment,
                        __v: booking.__v,
                        updated_at: booking.updated_at,
                        updated_at: booking.updated_at,
                    });
                }
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: bookings,
            responseInfo: {
                totalResult: totalResult
            }
        });
    }
    else {
        if (req.query.status) {
            if (req.query.status == "Missed") {
                date = new Date()

                var to = new Date(date - 24 * 60 * 60 * 1000);
                to.setDate(date.getDate() - 1);
                to.setHours(23, 59, 59)

                queries = {
                    business: business,
                    status: { $ne: "Inactive" },
                    $and: [
                        {
                            status: { $ne: "Rejected" }
                        },
                        {
                            status: { $ne: "Cancelled" }
                        },
                        {
                            status: { $ne: "Completed" }
                        }
                    ],
                    is_services: true,
                    date: { "$lte": to }
                };
                sortBy = { date: 1 }
            }
            else if (req.query.status == "Rework") {
                queries = {
                    is_rework: true
                };
                sortBy = { updated_at: -1 }
            }
            else {
                if (req.query.sortBy) {
                    if (req.query.sortBy == "date") {
                        var date = new Date();
                        date.setDate(date.getDate() - 1);
                        // console.log(date)
                        queries = {
                            business: business,
                            status: req.query.status,
                            is_services: true,
                            date: { "$gte": date }
                        };
                        sortBy = { date: 1 }
                    }
                }
                else {
                    queries = {
                        business: business,
                        status: req.query.status,
                        is_services: true,
                    }
                    sortBy = { date: 1 }
                }
            }
        }
        else {
            if (req.query.sortBy) {
                if (req.query.sortBy == "date") {
                    var date = new Date();
                    date.setDate(date.getDate() - 1);

                    queries = {
                        business: business,
                        status: { $ne: "Inactive" },
                        is_services: true,
                        date: { "$gte": date }
                    };
                    sortBy = { date: 1 }
                }
            }
            else {
                queries = {
                    status: { $ne: "Inactive" },
                    business: business,
                    is_services: true,
                }
                sortBy = { date: 1 }
            }
        }

        totalResult = await Booking.find(queries).count().exec();
        var thumbnail = [];
        await Booking.find(queries)
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
            .sort(sortBy).skip(config.perPage * page).limit(config.perPage)
            .cursor().eachAsync(async (booking) => {
                if (booking.status == "Pending" || booking.status == "Confirmed" || booking.status == "Completed" || booking.status == "Approval" || booking.status == "Rejected" || booking.status == "Approved" || booking.is_rework == true) {
                    var address = await Address.findOne({ _id: booking.address }).exec();
                    if (booking.car) {
                        if (booking.car.thumbnails[0]) {
                            var thumbnail = [booking.car.thumbnails[0]];
                        }
                        else {
                            var thumbnail = []
                        }

                        var car = {
                            title: booking.car.title,
                            _id: booking.car._id,
                            id: booking.car.id,
                            rc_address: booking.car.rc_address,
                            ic_address: booking.car.ic_address,
                            ic: booking.car.ic,
                            rc: booking.car.rc,
                            registration_no: booking.car.registration_no,
                        }
                    }
                    else {
                        var car = {
                            title: "",
                            _id: null,
                            id: null,
                            rc_address: "",
                            ic_address: "",
                            ic: "",
                            rc: "",
                            registration_no: "",
                        }

                    }

                    bookings.push({
                        _id: booking._id,
                        id: booking._id,
                        car: car,
                        user: {
                            name: booking.user.name,
                            _id: booking.user._id,
                            id: booking.user.id,
                            contact_no: booking.user.contact_no
                        },
                        manager: booking.manager,
                        services: booking.services,
                        convenience: booking.convenience,
                        date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                        time_slot: booking.time_slot,
                        status: booking.status,
                        booking_no: booking.booking_no,
                        address: address,
                        payment: booking.payment,
                        estimation_requested: booking.estimation_requested,
                        customer_requirements: booking.customer_requirements,
                        __v: booking.__v,
                        updated_at: booking.updated_at,
                        updated_at: booking.updated_at,
                    });
                }
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: bookings,
            responseInfo: {
                totalResult: totalResult
            }
        });
    }
});


router.get('/user/bookings/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;

    var role = await Management.findOne({ user: user, business: business }).exec();
    // console.log(role)
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var queries = new Object();
    var sortBy = new Object();

    if (req.query.by == "user") {
        queries = {
            user: req.query.query
        }
    }

    if (req.query.by == "contact") {
        var user = await User.findOne({ contact_no: req.query.query }).exec();
        queries = {
            user: user._id
        }
    }

    totalResult = await Booking.find(queries).count().exec();

    await Booking.find(queries)
        .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
        .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no" } })
        .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
        .sort({ updated_at: -1 }).skip(config.perPage * page).limit(config.perPage)
        .cursor().eachAsync(async (booking) => {
            if (booking.status == "Pending" || booking.status == "Confirmed" || booking.status == "Completed" || booking.status == "Approval" || booking.status == "Rejected" || booking.status == "Approved" || booking.is_rework == true) {
                if (booking.address) {
                    var address = await Address.findOne({ _id: booking.address }).exec();
                }
                else {
                    var address = {};
                }
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
                        ic: booking.car.ic,
                        rc: booking.car.rc,
                        rc_address: booking.car.rc_address,
                        ic_address: booking.car.ic_address,
                        registration_no: booking.car.registration_no,
                        thumbnails: thumbnail
                    },
                    user: {
                        name: booking.user.name,
                        _id: booking.user._id,
                        id: booking.user.id,
                        contact_no: booking.user.contact_no
                    },
                    manager: booking.manager,
                    services: booking.services,
                    convenience: booking.convenience,
                    date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                    time_slot: booking.time_slot,
                    status: booking.status,
                    booking_no: booking.booking_no,
                    estimation_requested: booking.estimation_requested,
                    address: address,
                    payment: booking.payment,
                    txnid: booking.txnid,
                    __v: booking.__v,
                    updated_at: booking.updated_at,
                    updated_at: booking.updated_at,
                });
            }
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: bookings,
        responseInfo: {
            totalResult: totalResult
        }
    });

});

/*
 * [Bookings API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.get('/bookings/assigned/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;



    var role = await Management.findOne({ user: user, business: business }).exec();
    // console.log(role)
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var queries = new Object();
    var sortBy = new Object();

    if (role.role == "Service Advisor") {

        var queries = {
            status: "Assigned",
            advisor: user,
            business: business,
            is_services: true,
        }
        sortBy = { created_at: -1 }


        var totalResult = await Booking.find(queries).count().exec();

        await Booking.find(queries)
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
            .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
            .cursor().eachAsync(async (booking) => {

                if (booking.car) {
                    var car = {
                        _id: booking.car._id,
                        id: booking.car._id,
                        title: booking.car.title,
                        registration_no: booking.car.registration_no
                    }
                }
                else {
                    var car = null
                }

                if (booking.address) {
                    var address = await Address.findOne({ _id: booking.address }).exec();
                }
                else {
                    var address = {};
                }

                if (booking.lead) {
                    await Lead.find({ lead: booking.lead }).populate({ path: 'manager', populate: { path: 'user', select: "-password - optional_info - business_info -account_info" } }).cursor().eachAsync(async (l) => {

                        lead = {
                            type: l.type,
                            geometry: l.geometry,
                            source: l.source,
                            lead: l.lead,
                            manager: {
                                name: l.manager.name,
                                email: l.manager.email,
                                id: l.manager.id,
                            },
                            id: l._id
                        };
                    });


                }
                else {
                    var lead = null;
                }

                bookings.push({
                    _id: booking._id,
                    id: booking._id,
                    car: car,
                    user: {
                        name: booking.user.name,
                        _id: booking.user._id,
                        id: booking.user.id,
                        contact_no: booking.user.contact_no
                    },
                    services: booking.services,
                    manager: booking.manager,
                    convenience: booking.convenience,
                    date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                    time_slot: booking.time_slot,
                    status: booking.status,
                    booking_no: booking.booking_no,
                    address: address,
                    lead: lead,
                    estimation_requested: booking.estimation_requested,
                    customer_requirements: booking.customer_requirements,
                    payment: booking.payment,
                    txnid: booking.txnid,
                    __v: booking.__v,
                    updated_at: booking.updated_at,
                    updated_at: booking.updated_at,
                });
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: bookings,
            responseInfo: {
                totalResult: totalResult
            }
        });
    }
    else {

        var queries = {
            status: "Assigned",
            business: business,
            is_services: true,
        }
        sortBy = { created_at: -1 }

        var totalResult = await Booking.find(queries).count().exec();

        await Booking.find(queries)
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no" } })
            .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
            .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
            .cursor().eachAsync(async (booking) => {
                var lead = null;
                if (booking.car) {
                    var car = {
                        _id: booking.car._id,
                        id: booking.car._id,
                        title: booking.car.title,
                        registration_no: booking.car.registration_no
                    }
                }
                else {
                    var car = null
                }

                if (booking.address) {
                    var address = await Address.findOne({ _id: booking.address }).exec();
                }
                else {
                    var address = {};
                }

                if (booking.lead) {
                    await Lead.find({ lead: booking.lead }).populate({ path: 'manager', populate: { path: 'user', select: "-password - optional_info - business_info -account_info" } }).cursor().eachAsync(async (l) => {

                        lead = {
                            type: l.type,
                            geometry: l.geometry,
                            source: l.source,
                            lead: l.lead,
                            manager: {
                                name: l.manager.name,
                                email: l.manager.email,
                                id: l.manager.id,
                            },
                            id: l._id
                        };
                    });
                    // console.log(l.user)
                }

                bookings.push({
                    _id: booking._id,
                    id: booking._id,
                    car: car,
                    user: {
                        name: booking.user.name,
                        _id: booking.user._id,
                        id: booking.user.id,
                        contact_no: booking.user.contact_no
                    },
                    manager: booking.manager,
                    services: booking.services,
                    convenience: booking.convenience,
                    date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                    time_slot: booking.time_slot,
                    status: booking.status,
                    booking_no: booking.booking_no,
                    estimation_requested: booking.estimation_requested,
                    address: address,
                    lead: lead,
                    customer_requirements: booking.customer_requirements,
                    payment: booking.payment,
                    txnid: booking.txnid,
                    __v: booking.__v,
                    updated_at: booking.updated_at,
                    updated_at: booking.updated_at,
                });
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: bookings,
            responseInfo: {
                totalResult: totalResult
            }
        });
    }
});

/**
    * [List product categories]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/

router.post('/booking/follow-up', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var rules = {
        id: 'required'
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Label required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var role = await Management.findOne({ user: user, business: business }).exec();
        if (role.role == "Service Advisor") {
            var booking = await Booking.findOne({ advisor: user, _id: req.body.id }).exec();
        }
        else if (role.role == "Admin") {
            var booking = await Booking.findOne({ business: business, _id: req.body.id }).exec();
        }
        else {
            var booking = {}
        }

        if (booking) {
            var check = await Lead.findOne({ _id: booking.lead }).exec();
            if (check) {
                var data = {};
                var follow_up = {};
                var status = await LeadStatus.findOne({ status: req.body.status }).exec()
                if (status.status == "Follow-Up") {
                    var follow_up = {
                        date: new Date(req.body.date).toISOString(),
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                }
                data = {
                    updated_at: new Date(),
                    remark: {
                        lead: booking.lead,
                        status: status.status,
                        color_code: status.color_code,
                        assignee: booking.advisor,
                        customer_remark: req.body.customer_remark,
                        assignee_remark: req.body.assignee_remark,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    follow_up: follow_up
                };

                Lead.findOneAndUpdate({ _id: check._id }, { $set: data }, { new: false }, async function (err, doc) {
                    Booking.findOneAndUpdate({ _id: booking._id }, { $set: { status: "Follow-Up", updated_at: new Date() } }, { new: false }, async function (err, doc) { })

                    LeadRemark.create(data.remark);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "",
                        responseData: await Lead.findOne({ _id: check._id }).exec()
                    })
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Lead not found",
                    responseData: {
                    }
                })
            }
        }
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {
                }
            })
        }
    }
});

router.post('/user/car/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];

    var currentDate = new Date();

    var booking = await Booking.findOne({ _id: req.body.id }).populate('model').select('-service_schedule').exec();
    var variant = await Variant.findOne({ _id: req.body.variant }).populate('model').select('-service_schedule').exec();

    if (booking) {
        if (variant != null && variant) {
            var reg = await Car.find({ registration_no: req.body.registration_no, status: true }).exec();
            if (Object.keys(reg).length == 0) {
                var count = await Car.find({}).count().exec();

                req.body.geometry = [0, 0];

                req.body.created_at = currentDate;
                req.body.updated_at = currentDate;

                req.body.title = variant.variant;
                req.body.automaker = variant.model.automaker;
                req.body.model = variant.model._id;
                req.body.user = booking.user;
                req.body.fuel_type = variant.specification.fuel_type;
                req.body.transmission = variant.specification.type;
                req.body.carId = Math.round(+new Date() / 1000),

                    await Car.create(req.body).then(async function (car) {

                        Booking.findOneAndUpdate({ _id: booking._id }, { $set: { car: car._id } }, { new: false }, async function (err, doc) {

                            fun.addMember(booking.user, variant.model);

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
                        });

                    }).catch(next);
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
            responseMessage: "Booking not found",
            responseData: {}
        });
    }
});

router.post('/booking/user/car/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];

    var currentDate = new Date();
    var booking = await Booking.findOne({ _id: req.body.booking }).exec();
    if (booking) {
        var car = await Car.findOne({ _id: req.body.car }).exec();
        if (car) {
            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { car: car._id } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Unprocessable Entity",
                        responseData: {}
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Car has been added",
                        responseData: {}
                    });
                }
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
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking not found",
            responseData: {}
        });
    }
});


router.get('/user/cars/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var car = []
    var currentDate = new Date();


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
                service_history: doc.service_history,
                transmission: doc.transmission,
                vehicle_color: doc.vehicle_color,
                vehicle_status: doc.vehicle_status,
                geometry: doc.geometry,
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
                created_at: doc.created_at,
                updated_at: doc.updated_at
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: car
    });

});

router.get('/booking/services/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        car: 'required',
    };

    var validation = new Validator(req.query, rules);

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
        var business = req.headers['business'];
        var packages = [];


        var car = await Car.findOne({ _id: req.query.car }).exec();

        if (car) {
            var variant = await Variant.findOne({ _id: car.variant }).exec();
            var carLength = parseInt(variant.specification.length);

            if (req.query.type == "services") {
                if (business == "5bfec47ef651033d1c99fbca") {
                    if (car.fuel_type == "Petrol" || car.fuel_type == "Diesel") {
                        await Service.find({ model: car.model, fuel_type: car.fuel_type, })
                            .cursor().eachAsync(async (service) => {
                                var labour_cost = service.labour_cost;

                                var serviceName = service.service;
                                if (service.mileage) {
                                    var serviceName = service.service + " (" + service.mileage + " KM)"
                                }

                                packages.push({
                                    automaker: service.automaker,
                                    model: service.model,
                                    for: service.for,
                                    package: service.package,
                                    service: serviceName,
                                    description: service.description,
                                    labour_cost: labour_cost,
                                    part_cost: service.part_cost,
                                    mrp: service.mrp,
                                    cost: service.part_cost + labour_cost,
                                    originalCost: service.part_cost + service.labour_cost,
                                    is_common: service.is_common,
                                    inclusions: service.inclusions,
                                    fuel_type: service.fuel_type,
                                    unit: service.unit,
                                    doorstep: service.doorstep,
                                    type: "services",
                                    id: service.id,
                                    _id: service._id
                                })
                            });

                        await Service.find({ model: car.model, fuel_type: "" }).cursor().eachAsync(async (service) => {

                            var labour_cost = service.labour_cost;

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
                                unit: service.unit,
                                type: "services",
                                id: service.id,
                                _id: service._id
                            })
                        });

                        await Service.find({ is_common: true }).cursor().eachAsync(async (service) => {
                            var labour_cost = service.labour_cost;
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
                                unit: service.unit,
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
                                var labour_cost = service.labour_cost;

                                var serviceName = service.service;
                                if (service.mileage) {
                                    var serviceName = service.service + " (" + service.mileage + " KM)"
                                }

                                packages.push({
                                    automaker: service.automaker,
                                    model: service.model,
                                    for: service.for,
                                    package: service.package,
                                    service: serviceName,
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
                                    unit: service.unit,
                                    type: "services",
                                    id: service.id,
                                    _id: service._id
                                })
                            });

                        await Service.find({ is_common: true }).cursor().eachAsync(async (service) => {
                            var labour_cost = service.labour_cost;
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
                                unit: service.unit,
                                type: "services",
                                id: service.id,
                                _id: service._id
                            })
                        });

                        await Service.find({ model: car.model, $or: [{ service: "Wheel Alignment" }, { service: "Wheel Balancing (cost per tyre, weights excluded)" }] }).cursor().eachAsync(async (service) => {
                            var labour_cost = service.labour_cost;
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
                                unit: service.unit,
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
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "'CarEager Xpress Gurugram' is specifically designed for cars with a minimum length of 13 feet.\n\nPlease change the business. And if you unable to find a suitable business, please hold on, we're adding more businesses shortly.",
                        responseData: [],
                    });
                }
            }
            else if (req.query.type == "collision") {
                if (business == "5bfec47ef651033d1c99fbca") {
                    await Collision.find({ model: car.model }).cursor().eachAsync(async (service) => {
                        // console.log(service)
                        var labour_cost = service.labour_cost;
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
                            package: service.paint,
                            unit: service.unit,
                            id: service.id,
                            doorstep: service.doorstep,
                            type: "collision",
                            _id: service._id
                        })
                    });

                    packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                    packageDiscountOn = []
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Collision",
                        responseData: packages
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "'CarEager Xpress Gurugram' is specifically designed for cars with a minimum length of 13 feet.\n\nPlease change the business. And if you unable to find a suitable business, please hold on, we're adding more businesses shortly.",
                        responseData: [],
                    });
                }
            }
            else if (req.query.type == "washing") {

                await Washing.find({ model: car.model }).cursor().eachAsync(async (service) => {
                    var labour_cost = service.labour_cost;
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
                        unit: service.unit,
                        id: service.id,
                        doorstep: service.doorstep,
                        _id: service._id
                    });
                });

                await Package.find({ category: "washing", automakers: car.automaker }).cursor().eachAsync(async (service) => {
                    packages.push({
                        service: service.name + ' - (Package)',
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
            else if (req.query.type == "product") {
                await Product.find({ is_common: true }).cursor().eachAsync(async (service) => {
                    var labour_cost = service.labour_cost;

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
                        labour_cost: labour_cost,
                        part_cost: service.part_cost,
                        mrp: service.mrp,
                        cost: service.part_cost + labour_cost,
                        originalCost: service.part_cost + service.labour_cost,
                        is_common: service.is_common,
                        inclusions: service.inclusions,
                        fuel_type: service.fuel_type,
                        doorstep: service.doorstep,
                        type: "product",
                        id: service.id,
                        _id: service._id
                    });
                });

                packages = _(packages).groupBy(x => x.package).map((value, key) => ({ package: key, services: value })).value();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Package",
                    responseData: packages
                });
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


router.post('/booking/service/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookingService = [];
    var labour_cost = 0;
    var part_cost = 0;

    var role = await Management.findOne({ user: user, business: business }).exec();

    // console.log(req.body)
    var currentDate = new Date();
    var services = req.body.services;
    var checkBooking = await Booking.findOne({ _id: req.body.id, business: business }).populate('model').select('-service_schedule').exec();
    var checkVendor = await User.find({ '_id': business }).count().exec();
    if (checkBooking) {
        if (checkVendor > 0) {
            for (var i = 0; i < services.length; i++) {
                if (services[i].type == "services") {
                    await Service.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                        if (service) {

                            var serviceName = service.service;

                            /*if(service.mileage){
                                var serviceName = service.service+" ("+service.mileage+" KM)"
                            }*/

                            bookingService.push({
                                source: service._id,
                                service: service.service,
                                mileage: service.mileage,
                                parts: service.parts,
                                description: service.description,
                                cost: Math.ceil(service.labour_cost) + Math.ceil(service.part_cost),
                                labour_cost: Math.ceil(service.labour_cost),
                                part_cost: Math.ceil(service.part_cost),
                                type: "services"
                            });

                            part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                            labour_cost = Math.ceil(labour_cost) + Math.ceil(service.labour_cost);


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
                            bookingService.push({
                                source: service._id,
                                service: service.service,
                                description: service.description,
                                cost: parseInt(service.labour_cost) + parseInt(service.part_cost),
                                labour_cost: Math.ceil(service.labour_cost),
                                part_cost: Math.ceil(service.part_cost),
                                type: "collision"
                            });
                            part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                            labour_cost = Math.ceil(labour_cost) + Math.ceil(service.labour_cost);
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
                            bookingService.push({
                                source: service._id,
                                service: service.service,
                                description: service.description,
                                cost: Math.ceil(service.labour_cost) + Math.ceil(service.part_cost),
                                labour_cost: Math.ceil(service.labour_cost),
                                part_cost: Math.ceil(service.part_cost),
                                type: "washing"
                            });

                            part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                            labour_cost = Math.ceil(labour_cost) + Math.ceil(service.labour_cost);

                            // console.log(labour_cost)
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

                            bookingService.push({
                                source: service._id,
                                service: service.product,
                                description: service.description,
                                cost: Math.ceil(service.labour_cost) + Math.ceil(service.part_cost),
                                labour_cost: Math.ceil(service.labour_cost),
                                part_cost: Math.ceil(service.part_cost),
                                type: "product"
                            });
                            part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                            labour_cost = Math.ceil(labour_cost) + Math.ceil(service.labour_cost);
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

                else if (services[i].type == "customization") {
                    await Customization.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                        if (service) {


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
                                cost: (Math.ceil(service.labour_cost) + Math.ceil(service.part_cost)) * quantity,
                                labour_cost: Math.ceil(service.labour_cost),
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

                else if (services[i].type == "custom") {
                    bookingService.push({
                        source: null,
                        service: services[i].service,
                        description: services[i].description,
                        cost: parseInt(services[i].labour_cost) + parseInt(services[i].part_cost),
                        labour_cost: parseInt(services[i].labour_cost),
                        part_cost: parseInt(services[i].part_cost),
                        type: "custom"
                    });

                    part_cost = Math.ceil(part_cost) + Math.ceil(services[i].part_cost);
                    labour_cost = Math.ceil(labour_cost) + Math.ceil(services[i].labour_cost);
                }
            }

            if (bookingService.length > 0) {
                var total = Math.ceil(part_cost) + Math.ceil(labour_cost);
                var payment = {
                    payment_mode: req.body.payment_mode,
                    payment_status: "Pending",
                    discount_type: "",
                    coupon: "",
                    coupon_type: "",
                    discount: 0,
                    discount_total: 0,
                    part_cost: Math.ceil(part_cost),
                    labour_cost: Math.ceil(labour_cost),
                    paid_total: 0,
                    total: total,
                    discount_applied: false,
                    transaction_id: "",
                    transaction_date: "",
                    transaction_status: "",
                    transaction_response: ""
                }
                var due = {
                    due: total,
                }

                var date = new Date(req.body.date).toISOString();

                var data = {
                    services: bookingService,
                    date: date,
                    time_slot: req.body.time_slot,
                    convenience: req.body.convenience,
                    status: "Approval",
                    payment: payment,
                    due: due,
                    address: null,
                    is_services: true,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                Booking.findOneAndUpdate({ _id: checkBooking._id }, { $set: data }, { new: true }, async function (err, doc) {
                    if (!err) {
                        var booking = await Booking.findById(checkBooking._id).exec();
                        event.zohoLead(booking._id);
                        event.estimateMail(booking._id);

                        var notify = {
                            receiver: [booking.user],
                            activity: "booking",
                            tag: "estimation",
                            source: booking._id,
                            sender: booking.business,
                            points: 0
                        }

                        fun.newNotification(notify);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Service estimate has been sent.",
                            responseData: booking
                        });
                    }
                });
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
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Business not found",
                responseData: {},
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking not found",
            responseData: {},
        });
    }
});


router.post('/service/estimate/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookingService = [];

    var currentDate = new Date();
    var role = await Management.findOne({ user: user, business: business }).exec();
    if (role.role == "Service Advisor") {
        var queries = {
            _id: req.body.id,
            advisor: user,
            business: business,
            is_services: true,
        }
    }
    else {
        var queries = {
            _id: req.body.id,
            business: business,
            is_services: true,
        }
    }
    var booking = await Booking.findOne(queries).exec();
    var services = req.body.services;
    if (booking) {
        var due = 0;
        if (booking.due) {
            if (booking.due.due) {
                due = booking.due.due;
            }
        }

        var labour_cost = booking.payment.labour_cost;
        var part_cost = booking.payment.part_cost;

        for (var i = 0; i < services.length; i++) {
            if (services[i].type == "services") {
                await Service.find({ _id: services[i].id }).cursor().eachAsync(async (service) => {
                    if (service) {

                        var serviceName = service.service;
                        if (service.mileage) {
                            var serviceName = service.service + " (" + service.mileage + " KM)"
                        }

                        bookingService.push({
                            source: service._id,
                            service: serviceName,
                            parts: service.parts,
                            description: service.description,
                            cost: Math.ceil(services[i].part_cost) + Math.ceil(services[i].labour_cost),
                            labour_cost: Math.ceil(services[i].labour_cost),
                            part_cost: Math.ceil(services[i].part_cost),
                            type: "services"
                        });
                        part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                        labour_cost = Math.ceil(labour_cost) + Math.ceil(service.labour_cost);

                        due = due + Math.ceil(service.part_cost) + Math.ceil(service.labour_cost)
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
                        bookingService.push({
                            source: service._id,
                            service: service.service,
                            description: service.description,
                            cost: Math.ceil(services[i].part_cost) + Math.ceil(services[i].labour_cost),
                            labour_cost: Math.ceil(services[i].labour_cost),
                            part_cost: Math.ceil(services[i].part_cost),
                            type: "collision"
                        });
                        part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                        labour_cost = Math.ceil(labour_cost) + Math.ceil(service.labour_cost);

                        due = due + Math.ceil(service.part_cost) + Math.ceil(service.labour_cost)
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
                        bookingService.push({
                            source: service._id,
                            service: service.service,
                            description: service.description,
                            cost: Math.ceil(services[i].part_cost) + Math.ceil(services[i].labour_cost),
                            labour_cost: Math.ceil(services[i].labour_cost),
                            part_cost: Math.ceil(services[i].part_cost),
                            type: "washing"
                        });
                        part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                        labour_cost = Math.ceil(labour_cost) + Math.ceil(service.labour_cost);

                        due = due + Math.ceil(service.part_cost) + Math.ceil(service.labour_cost)
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

                        bookingService.push({
                            source: service._id,
                            service: service.product,
                            description: service.description,
                            cost: Math.ceil(services[i].part_cost) + Math.ceil(services[i].labour_cost),
                            labour_cost: Math.ceil(services[i].labour_cost),
                            part_cost: Math.ceil(services[i].part_cost),
                            type: "product"
                        });
                        part_cost = Math.ceil(part_cost) + Math.ceil(service.part_cost);
                        labour_cost = Math.ceil(labour_cost) + Math.ceil(service.labour_cost);

                        due = due + Math.ceil(service.part_cost) + Math.ceil(service.labour_cost)
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
            else if (services[i].type == "custom") {
                bookingService.push({
                    source: null,
                    service: services[i].service,
                    description: services[i].description,
                    cost: Math.ceil(services[i].part_cost) + Math.ceil(services[i].labour_cost),
                    labour_cost: Math.ceil(services[i].labour_cost),
                    part_cost: Math.ceil(services[i].part_cost),
                    type: "custom"
                });
                part_cost = Math.ceil(part_cost) + Math.ceil(services[i].part_cost);
                labour_cost = Math.ceil(labour_cost) + Math.ceil(services[i].labour_cost);

                due = due + Math.ceil(services[i].part_cost) + Math.ceil(services[i].labour_cost)
            }
        }


        var data = {

        }


        Booking.findOneAndUpdate({ _id: booking._id }, { $push: { services: bookingService } }, { new: false }, async function (err, doc) {
            var data = {
                status: "Approval",
                payment: {
                    payment_mode: booking.payment.payment_mode,
                    payment_status: booking.payment.payment_status,
                    discount_type: booking.payment.discount_type,
                    coupon_type: booking.payment.coupon_type,
                    coupon: booking.payment.coupon,
                    discount: booking.payment.discount,
                    discount_total: booking.payment.discount_total,
                    discount_applied: booking.payment.discount_applied,
                    transaction_id: booking.payment.transaction_id,
                    transaction_date: booking.payment.transaction_date,
                    transaction_status: booking.payment.transaction_status,
                    transaction_response: booking.payment.transaction_response,
                    paid_total: booking.payment.paid_total,
                    part_cost: part_cost,
                    labour_cost: labour_cost,
                    total: part_cost + labour_cost
                },
                due: {
                    due: due
                },
                updated_at: new Date()
            }

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                var notify = {
                    receiver: [booking.user],
                    activity: "booking",
                    tag: "estimation",
                    source: booking._id,
                    sender: booking.business,
                    points: 0
                }

                fun.newNotification(notify);
                event.zohoLead(booking._id);
                event.estimateMail(booking._id);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Service estimate has been sent",
                    responseData: {}
                });
            });
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

/**
 * [Status Count]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/bookings/count', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var status = [];

    var pending = await Booking.find({ business: business, is_services: true, status: "Pending" }).count().exec();

    status.push({
        status: "Pending",
        count: pending
    });

    var confirmed = await Booking.find({ business: business, is_services: true, status: "Confirmed" }).count().exec();
    status.push({
        status: "Confirmed",
        count: confirmed
    })

    var completed = await Booking.find({ business: business, is_services: true, status: "Completed" }).count().exec();
    status.push({
        status: "Completed",
        count: completed
    })

    var rejected = await Booking.find({ business: business, is_services: true, status: "Rejected" }).count().exec();
    status.push({
        status: "Rejected",
        count: rejected
    })

    var cancelled = await Booking.find({ business: business, is_services: true, status: "Cancelled" }).count().exec();
    status.push({
        status: "Cancelled",
        count: cancelled
    })


    var date = new Date();
    date.setDate(date.getDate() - 1);
    queries = {
        business: business,
        status: { $ne: "Inactive" },

        $or: [
            {
                status: { $ne: "Rejected" }
            },
            {
                status: { $ne: "Cancelled" }
            },
            {
                status: { $ne: "Completed" }
            }
        ],
        is_services: true,
        date: { "$lte": date }
    };

    var missed = await Booking.find(queries).count().exec();
    status.push({
        status: "Missed",
        count: missed
    })

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: status
    });
});



/**
 * [Booking Status Update API]
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
        var business = req.headers['business'];


        if (req.body.status == "Confirmed" || req.body.status == "Completed" || req.body.status == "Rejected" || req.body.status == "Closed" || req.body.status == "InProgress") {
            var check = await Booking.findOne({ _id: req.body.id, business: business, is_services: true }).exec();

            if (!check) {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Booking not found",
                    responseData: {},
                });
            }
            else {

                var status = check.status;
                var data = {
                    status: req.body.status,
                    is_rework: false,
                    is_reviewed: false,
                    updated_at: new Date()
                };
                if (check.status != req.body.status) {
                    /* if(check.status != "Completed" && check.is_rework == true)
                     {*/
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

                            var activity = {
                                user: user,
                                model: "Booking",
                                activity: "updateBookingStatus",
                                source: booking._id,
                                modified: check.status + " to " + data.status,
                                created_at: data.updated_at,
                                updated_at: data.updated_at
                            }
                            fun.activityLog(activity);

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

                            if (req.body.status == "Rejected") {
                                var notify = {
                                    receiver: [booking.user],
                                    activity: "booking",
                                    tag: "bookingRejected",
                                    source: check._id,
                                    sender: null,
                                    points: 0
                                }

                                fun.newNotification(notify);

                                if (booking.manager) {
                                    var notify = {
                                        receiver: [booking.manager],
                                        activity: "booking",
                                        tag: "bookingRejected",
                                        source: check._id,
                                        sender: null,
                                        points: 0
                                    }

                                    fun.newNotification(notify);
                                }

                                event.zohoLead(booking._id)

                            }

                            else if (req.body.status == "Completed" && status != "Completed") {
                                var point = {
                                    user: check.user,
                                    activity: "coin",
                                    tag: "bookingCompleted",
                                    source: check._id,
                                    sender: null,
                                    points: 50,
                                    status: true
                                }

                                fun.addPoints(point)

                                if (booking.manager) {
                                    var notify = {
                                        receiver: [booking.manager],
                                        activity: "booking",
                                        tag: "bookingCompleted",
                                        source: check._id,
                                        sender: null,
                                        points: 0
                                    }

                                    fun.newNotification(notify);
                                }
                                event.zohoLead(booking._id)

                                if (booking.due) {
                                    var paid_total = booking.payment.paid_total + booking.due.due;

                                    Booking.findOneAndUpdate({ _id: req.body.id }, { $set: { "payment.payment_status": "Success", "payment.paid_total": paid_total, due: null } }, { new: false }, async function (err, doc) { })
                                }
                            }

                            var json = ({
                                responseCode: 200,
                                responseMessage: "Booking has been " + req.body.status,
                                responseData: {}
                            });
                            res.status(200).json(json)
                        }
                    });
                    /* }
                     else
                     {
                         res.status(422).json({
                             responseCode: 422,
                             responseMessage: "Booking has been already Completed",
                             responseData: {},
                         }); 
                     }*/
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Booking has been " + req.body.status,
                        responseData: {},
                    });
                }

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
 * [Booking Reshechudling API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/

router.put('/booking/reschedule/', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
        date: 'required',
        time_slot: 'required'
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
        var business = req.headers['business'];
        var total = 0;
        var labour_cost = 0;
        var part_cost = 0;
        var bookingService = [];
        var services = req.body.services;
        var userType = await User.findOne({ _id: user }).exec();

        var status = "Confirmed"


        var check = await Booking.findOne({ _id: req.body.id, business: business, is_services: true }).exec();

        if (!check) {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {},
            });
        }
        else {
            var data = {
                date: new Date(req.body.date).toISOString(),
                time_slot: req.body.time_slot,
                status: "Confirmed",
                is_rework: false,
                updated_at: new Date()
            };

            Booking.findOneAndUpdate({ _id: check._id }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });
                    res.status(400).json(json)
                }
                else {

                    var booking = await Booking.findById(check._id).exec()

                    var activity = {
                        user: user,
                        model: "Booking",
                        activity: "rescheduleBooking",
                        source: booking._id,
                        modified: moment(check.date).tz(req.headers['tz']).format('ll') + " (" + check.time_slot + ")" + " to " + moment(data.date).tz(req.headers['tz']).format('ll') + " (" + data.time_slot + ")",
                        created_at: data.updated_at,
                        updated_at: data.updated_at
                    }
                    fun.activityLog(activity);

                    var notify = {
                        receiver: [booking.user],
                        activity: "booking",
                        tag: "bookingReschedule",
                        source: booking._id,
                        sender: user,
                        points: 0,
                        tz: req.headers['tz']
                    };
                    fun.newNotification(notify);

                    event.rescheduleMail(booking._id, userType.account_info.type);

                    var json = ({
                        responseCode: 200,
                        responseMessage: "Booking rescheduled",
                        responseData: {
                            date: moment(data.date).tz(req.headers['tz']).format('ll'),
                            time_slot: data.time_slot,
                            updated_at: data.updated_at
                        }
                    });
                    res.status(200).json(json)
                }
            });
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
    res.status(200).json({
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

    res.status(200).json({
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

    res.status(200).json({
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
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];

    var productCount = await BusinessProduct.find({}).count().exec();

    var currentDate = new Date();
    req.body.created_at = currentDate;
    req.body.updated_at = currentDate;
    req.body.product_id = Math.round(+new Date() / 1000);
    req.body.business = business;

    Product.create(req.body).then(async function (pro) {
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
                            res.status(200).json({
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

            BusinessProduct.findOneAndUpdate({ _id: req.body.id, business: business }, { $set: data }, { new: true }, function (err, doc) { });

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
                res.status(200).json({
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

router.get('/search', xAccessToken.token, async function (req, res, next) {

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var query = req.query.query;

    var business = await User.find({ 'name': new RegExp(query, 'i') }).limit(config.perPage).skip(config.perPage * page).exec();

    res.status(200).json({
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

router.get('/analytic', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = req.headers['business'];
    var analytics = [];
    var paid_total = 0;
    var labour_cost = 0;
    var part_cost = 0;
    var date = new Date();
    if (req.query.type == "range") {
        if (req.query.query) {
            var query = req.query.query;
            var ret = query.split("to");

            var from = new Date(ret[0]);
            var to = new Date(ret[1]);
        }
        else {
            var from = new Date(date.getFullYear(), date.getMonth(), 1);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
    }

    else if (req.query.type == "period") {
        if (req.query.query) {
            var query = parseInt(req.query.query);
        }
        else {
            var query = 7
        }

        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    }
    else {
        var from = new Date(date.getFullYear(), date.getMonth(), 1);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }


    var totalBooking = await Booking.find({ business: business, is_services: true, status: { $ne: "Inactive" }, created_at: { $gte: from, $lte: to } }).count().exec();
    analytics.push({
        title: "Total Booking",
        count: totalBooking
    });

    var totalLeads = await Lead.find({ business: business, created_at: { $gte: from, $lte: to } }).count().exec();
    analytics.push({
        title: "Total Leads",
        count: totalLeads
    });

    var totalPackage = await UserPackage.find({ business: business, created_at: { $gte: from, $lte: to } }).count().exec();
    analytics.push({
        title: "Total Packages",
        count: totalPackage
    });

    var totalCoupon = await Coupon.find({}).count().exec();
    analytics.push({
        title: "Total Coupons",
        count: totalCoupon
    });

    var pendingBooking = await Booking.find({ business: business, is_services: true, status: "Pending", created_at: { $gte: from, $lte: to } }).count().exec();
    analytics.push({
        title: "Pending Booking",
        count: pendingBooking
    });

    var rejectedBooking = await Booking.find({ business: business, is_services: true, status: "Rejected", created_at: { $gte: from, $lte: to } }).count().exec();
    analytics.push({
        title: "Rejected Booking",
        count: rejectedBooking
    });

    var cancelledBooking = await Booking.find({ business: business, is_services: true, status: "Cancelled", created_at: { $gte: from, $lte: to } }).count().exec();
    analytics.push({
        title: "Cancelled Booking",
        count: cancelledBooking
    });

    var confirmedBooking = await Booking.find({ business: business, is_services: true, status: "Confirmed", created_at: { $gte: from, $lte: to } }).count().exec();
    analytics.push({
        title: "Confirmed Booking",
        count: confirmedBooking
    });

    var completeBooking = await Booking.find({ business: business, is_services: true, status: "Completed", created_at: { $gte: from, $lte: to } }).count().exec();
    analytics.push({
        title: "Complete Booking",
        count: completeBooking
    });

    await Booking.find({ business: business, is_services: true, status: "Completed", created_at: { $gte: from, $lte: to } })
        .cursor().eachAsync(async (booking) => {
            paid_total = booking.payment.paid_total + paid_total;
            labour_cost = booking.payment.labour_cost + labour_cost;
            part_cost = booking.payment.part_cost + part_cost;

        });

    analytics.push({
        title: "Total Revenue",
        count: paid_total
    });

    analytics.push({
        title: "On Labour",
        count: labour_cost
    });

    analytics.push({
        title: "On Parts",
        count: part_cost
    });

    res.status(200).json({
        responseCode: 200,
        responseMessage: from + " - " + to,
        responseData: analytics
    })
});


/**
 * [Business Analytics API]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.get('/performance/analytic', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = req.headers['business'];

    var managements = [];
    var paid_total = 0;
    var labour_cost = 0;
    var part_cost = 0;
    var date = new Date();
    if (req.query.type == "range") {
        if (req.query.query) {
            var query = req.query.query;
            var ret = query.split("to");

            var from = new Date(ret[0]);
            var to = new Date(ret[1]);
        }
        else {
            var from = new Date(date.getFullYear(), date.getMonth(), 1);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
    }

    else if (req.query.type == "period") {
        if (req.query.query) {
            var query = parseInt(req.query.query);
        }
        else {
            var query = 7
        }

        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    }
    else {
        var from = new Date(date.getFullYear(), date.getMonth(), 1);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }

    await Management.find({ business: business })
        .populate({ path: 'user', select: '_id id name contact_no avatar avatar_address email' })
        .cursor().eachAsync(async (management) => {
            if (management.role != "Admin") {
                if (management.role == "Service Advisor") {
                    var analytics = [];
                    var totalBooking = await Booking.find({ advisor: management.user._id, is_services: true, status: { $ne: "Inactive" }, created_at: { $gte: from, $lte: to } }).count().exec();

                    analytics.push({
                        title: "Total Booking",
                        count: totalBooking
                    });

                    var lead_id = [];
                    await await Booking.find({ advisor: management.user._id, is_services: true, created_at: { $gte: from, $lte: to } })
                        .cursor().eachAsync(async (leadId) => {
                            lead_id.push(leadId.lead)
                        });

                    const unique_lead = Array.from(new Set(lead_id));

                    var converted = await LeadRemark.find({ lead: { $in: unique_lead }, status: "Assigned" }).count().exec();

                    analytics.push({
                        title: "Assigned Booking",
                        count: converted
                    });

                    var completed = await Booking.find({ advisor: management.user._id, is_services: true, status: "Completed", created_at: { $gte: from, $lte: to } }).count().exec();

                    analytics.push({
                        title: "Completed Booking",
                        count: completed
                    });


                    var rejected = await Booking.find({ advisor: management.user._id, is_services: true, status: "Rejected", created_at: { $gte: from, $lte: to } }).count().exec();

                    analytics.push({
                        title: "Rejected Booking",
                        count: rejected
                    });

                    var inProcess = await Booking.find({ advisor: management.user._id, is_services: true, $or: [{ status: "Confirmed" }, { status: "Pending" }, { status: "Approval" }],/* created_at:{$gte: from, $lte: to}*/ }).count().exec();

                    analytics.push({
                        title: "InProcess Booking",
                        count: inProcess
                    });

                    var rework = await Booking.find({ advisor: management.user._id, is_services: true, is_rework: true, /*created_at:{$gte: from, $lte: to}*/ }).count().exec();

                    analytics.push({
                        title: "Rework",
                        count: rework
                    });

                    managements.push({
                        id: management.user._id,
                        role: management.role,
                        name: management.user.name,
                        username: management.user.username,
                        email: management.user.email,
                        contact_no: management.user.contact_no,
                        avatar: management.user.avatar,
                        avatar_address: management.user.avatar_address,
                        analytics: analytics
                    });
                }
                else if (management.role == "CRE") {
                    var analytics = [];

                    var totalLeads = await Lead.find({ assignee: management.user._id, created_at: { $gte: from, $lte: to } }).count().exec();
                    analytics.push({
                        title: "Total Leads",
                        count: totalLeads
                    });

                    var open = await Lead.find({ assignee: management.user._id, "remark.status": "Open" /*,created_at:{$gte: from, $lte: to}*/ }).count().exec();
                    analytics.push({
                        title: "Open",
                        count: open
                    });

                    var lead_id = [];
                    await Lead.find({ assignee: management.user._id, created_at: { $gte: from, $lte: to } })
                        .cursor().eachAsync(async (leadId) => {
                            lead_id.push(leadId._id)
                        });

                    const unique_lead = Array.from(new Set(lead_id));

                    var converted = await LeadRemark.find({ lead: { $in: unique_lead }, status: "Assigned" }).count().exec();

                    analytics.push({
                        title: "Converted",
                        count: converted
                    });

                    var contacted = await Lead.find({ assignee: management.user._id, "remark.status": "Contacted" /*,created_at:{$gte: from, $lte: to}*/ }).count().exec();
                    analytics.push({
                        title: "Contacted",
                        count: contacted
                    });

                    var follow_up = await Lead.find({ assignee: management.user._id, "remark.status": "Follow-Up" /*,created_at:{$gte: from, $lte: to}*/ }).count().exec();
                    analytics.push({
                        title: "Follow Up",
                        count: follow_up
                    });

                    var totalClosedLeads = await Lead.find({ assignee: management.user._id, "remark.status": "Closed" /*,created_at:{$gte: from, $lte: to}*/ }).count().exec();
                    analytics.push({
                        title: "Closed",
                        count: totalClosedLeads
                    });

                    managements.push({
                        id: management.user._id,
                        name: management.user.name,
                        role: management.role,
                        username: management.user.username,
                        email: management.user.email,
                        contact_no: management.user.contact_no,
                        avatar: management.user.avatar,
                        avatar_address: management.user.avatar_address,
                        analytics: analytics
                    });
                }
            }
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: from + " - " + to,
        responseData: managements
    })
});



/**
 * [Purchased Packages API]
 * @param  {[raw json]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {middleware} next [description]
 * @return {[json]}        [description]
*/
router.get('/packages/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    var packages = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    await UserPackage.find({})
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
                        var usedPackage = await PackageUsed.findOne({ package: package._id, user: user, label: discount.label }).count().exec();
                        remains = discount.limit - usedPackage;
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
                        remains: remains
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


/**
 * [Add Product Images (AWS S3)]
 * @param  {[null]}   req  [description]
 * @param  {[json]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
*/

router.post('/gallery/image/add', xAccessToken.token, function (req, res, next) {
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
        } else {

            var rules = {
                source: 'required'
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
                if (req.body.category == "service") {
                    var check = await Service.findById(req.body.source).exec()
                }
                else if (req.body.category == "collision") {
                    var check = await Collision.findById(req.body.source).exec()
                }
                else if (req.body.category == "washing") {
                    var check = await Washing.findById(req.body.source).exec()
                }
                else if (req.body.category == "product") {
                    var check = await Product.findById(req.body.source).exec()
                }
                else if (req.body.category == "customization") {
                    var check = await Customization.findById(req.body.source).exec()
                }
                else {
                    var check = {}
                }

                if (check) {
                    var data = {
                        source: req.body.source,
                        file: req.files[0].key,
                        type: req.body.type,
                        category: req.body.category,
                        created_at: new Date(),
                        updated_at: new Date(),
                    };

                    var galleryImage = new Gallery(data);
                    galleryImage.save();

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "File has been uploaded",
                        responseData: {
                            item: galleryImage
                        }
                    })
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Source not found",
                        responseData: {}
                    })
                }
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

router.delete('/gallery/image/delete', xAccessToken.token, async function (req, res, next) {
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
        const media = await Gallery.findById(image_id).exec();

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
                    var deleteImage = Gallery.findByIdAndRemove(image_id).exec();
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


async function checkRelation(user, business) {
    var check = await Management.findOne({ user: user, business: business }).count().exec();
    if (check == 1) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = router
