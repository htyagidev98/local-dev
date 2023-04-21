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


const xAccessToken = require('../../middlewares/xAccessToken');
const event = require('../../api/v3/event');

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
const Collision = require('../../models/collision');
const Washing = require('../../models/washing');
const Product = require('../../models/product');
const LeadRemark = require('../../models/leadRemark');
const LeadStatus = require('../../models/leadStatus');
const Package = require('../../models/package');
const UserPackage = require('../../models/userPackage');
const Management = require('../../models/management');

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
            await Collision.find({ model: car.model, paint: req.body.paint }).cursor().eachAsync(async (service) => {

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
                    labour_cost: service.labour_cost,
                    part_cost: service.part_cost,
                    mrp: service.mrp,
                    cost: service.part_cost + service.labour_cost,
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
        var status = await LeadStatus.findOne({ status: "New" }).exec();

        data.user = user._id;
        data.name = user.name;
        data.contact_no = user.contact_no;
        data.email = user.email;
        data.type = req.query.type;
        data.geometry = [0, 0],
            data.remark = {
                status: status.status,
                remark: req.body.remark,
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

                event.zohoLead(lead)

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

            Lead.findOneAndUpdate({ user: user._id, type: req.query.type }, { $set: { updated_at: new Date() } }, { new: true }, async function (err, doc) { });

            bar = moment.tz(bar, req.headers['tz'])
            var serverTime = moment.tz(new Date(), req.headers['tz']);
            var bar = lead.updated_at;
            var baz = serverTime.diff(bar);

            var diff = (baz / (60 * 60 * 24 * 1000))

            // console.log(diff)

            if (diff >= 2) {
                event.zohoLead(lead)
            }

            return res.status(200).json({
                responseCode: 200,
                responseMessage: "Lead Added",
                responseData: {}
            });
        }
    }
    else {
        return res.status(422).json({
            responseCode: 422,
            responseMessage: "User Not Found",
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

router.post('/leads/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var data = {}
    var status = await LeadStatus.findOne({ status: "New" }).exec();

    data.user = null;
    data.name = req.body.name;
    data.contact_no = req.body.contact_no;
    data.email = req.body.email;
    data.type = req.body.source;
    data.geometry = [0, 0],
        data.remark = {
            status: status.status,
            remark: req.body.remark,
            color_code: status.color_code,
            created_at: new Date(),
            updated_at: new Date()
        };
    data.business = decoded.user,
        data.source = req.body.source;
    data.created_at = new Date();
    data.updated_at = new Date();

    var leads = {};

    Lead.create(data).then(async function (lead) {

        data.remark.lead = lead._id;
        LeadRemark.create(data.remark);

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

        event.zohoLead(lead)

        var json = ({
            responseCode: 200,
            responseMessage: "Lead Added",
            responseData: leads
        });
        res.status(200).json(json)
    });

});
/**
    * [Leads]
    * @param  {[json]}   req  [description]
    * @param  {[json]}   res  [description]
    * @param  {middleware} next [description]
    * @return {[json]}        [description]
*/


router.get('/leads/get', xAccessToken.token, async function (req, res, next) {
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var leads = [];
    var queries = {};

    if (req.query.status == "") {
        if (req.query.search == "") {
            queries = {};
        }
        else {
            queries = {
                $or: [
                    { 'name': { $regex: new RegExp(req.query.search, 'i') } },
                    { 'contact_no': { $regex: new RegExp(req.query.search, 'i') } }
                ]
            }
        }
    }
    else {
        if (req.query.search == "") {
            queries = {
                "remark.status": req.query.status,
            }
        }
        else {
            queries = {
                "remark.status": req.query.status,
                $or: [
                    { 'name': { $regex: new RegExp(req.query.search, 'i') } },
                    { 'contact_no': { $regex: new RegExp(req.query.search, 'i') } }
                ]
            }
        }
    }

    // console.log(queries)
    await Lead.find(queries)
        .sort({ created_at: -1 }).skip(config.perPage * page).limit(config.perPage)
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
                    date: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                    status: lead.status,
                    important: lead.important,
                    created_at: lead.created_at,
                    updated_at: lead.updated_at,
                    remark: lead.remark,
                });
            }
        });

    return res.status(200).json({
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

router.get('/lead/status/get', xAccessToken.token, async function (req, res, next) {
    var date = new Date("2019-01-07");
    var dow = date.getDay();
    // console.log(dow);
    var leads = [];
    await LeadStatus.find({})
        .cursor().eachAsync(async (lead) => {
            if (lead) {
                var remark = await LeadRemark.findOne({ lead: lead._id }).sort({ created_at: -1 }).exec();
                leads.push({
                    id: lead.id,
                    color_code: lead.color_code,
                    status: lead.status,
                    count: await Lead.find({ "remark.status": lead.status }).count().exec()
                });
            }
        });

    return res.status(200).json({
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
                remark: lead.remark,
                status: lead.status,
                created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: lead.updated_at,
            });
        });

    return res.status(200).json({
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

        await Lead.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {

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
        var status = await LeadStatus.findOne({ status: req.body.status }).exec()
        data = {
            remark: {
                status: status.status,
                color_code: status.color_code,
                remark: req.body.remark,
                created_at: new Date(),
                updated_at: new Date(),
            }
        };


        await Lead.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
            data.remark.lead = req.body.id;
            LeadRemark.create(data.remark);

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: await Lead.findOne({ _id: req.body.id }).exec()
            })
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
        var business = decoded.user;
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
            .select('name username avatar avatar_address contact_no email account_info')
            .populate({ path: 'car', select: '_id id title', populate: { path: 'thumbnails' } })
            .populate({ path: 'booking', select: '_id id booking_no service date time_slot status' })
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
                    .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                    .populate({ path: 'car', select: '_id id title registration_no' })
                    .sort({ date: 1 })
                    .cursor().eachAsync(async (booking) => {
                        bookings.push({
                            _id: booking._id,
                            id: booking._id,
                            car: {
                                title: booking.car.title,
                                _id: booking.car._id,
                                id: booking.car.id,
                                registration_no: booking.car.registration_no,
                            },
                            services: booking.services,
                            time_slot: booking.time_slot,
                            status: booking.status,
                            booking_no: booking.booking_no,
                        });
                    });

                if (bookings) {
                    var cars = [];
                    await Car.find({ user: user._id })
                        .select('_id id title registration_no')
                        .cursor().eachAsync(async (car) => {
                            cars.push({
                                _id: car._id,
                                id: car._id,
                                title: car.title,
                                registration_no: car.registration_no,
                            });
                        });

                    peoples.push({
                        _id: user._id,
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        contact_no: user.contact_no,
                        avatar_address: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/avatar/" + user.avatar,
                        account_info: user.account_info,
                        cars: cars,
                        bookings: bookings,
                        created_at: user.created_at,
                        updated_at: user.updated_at,
                        joined: moment(user.created_at).tz(req.headers['tz']).format('ll'),
                    });
                }
            });


        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: peoples,
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

    var status = [];

    var pending = await Booking.find({ business: user, is_services: true, status: "Pending" }).count().exec();

    status.push({
        status: "Pending",
        count: pending
    });

    var confirmed = await Booking.find({ business: user, is_services: true, status: "Confirmed" }).count().exec();
    status.push({
        status: "Confirmed",
        count: confirmed
    })

    var completed = await Booking.find({ business: user, is_services: true, status: "Completed" }).count().exec();
    status.push({
        status: "Completed",
        count: completed
    })

    var rejected = await Booking.find({ business: user, is_services: true, status: "Rejected" }).count().exec();
    status.push({
        status: "Rejected",
        count: rejected
    })

    var cancelled = await Booking.find({ business: user, is_services: true, status: "Cancelled" }).count().exec();
    status.push({
        status: "Cancelled",
        count: cancelled
    })


    var date = new Date();
    date.setDate(date.getDate() - 1);
    queries = {
        business: user,
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

    return res.status(200).json({
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
        if (req.body.status == "Confirmed" || req.body.status == "Completed" || req.body.status == "Rejected") {
            var check = await Booking.findOne({ _id: req.body.id, business: user, is_services: true }).exec();
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
                            points: 50,
                            status: true
                        }

                        fun.addPoints(point)
                    }

                    else if (req.body.status == "Cancelled") {

                        if (booking.package) {
                            var package = await UserPackage.findOne({ _id: booking.package, user: user, car: booking.car }).exec();
                            if (package) {
                                var checkPackageUsed = await PackageUsed.find({ package: booking.package, user: user, booking: booking._id, car: booking.car }).count().exec();
                                var serverTime = moment.tz(new Date(), req.headers['tz']);
                                var bar = moment.tz(package.expired_at, req.headers['tz']);
                                var baz = bar.diff(serverTime);
                                if (baz > 0) {
                                    var checkPackageUsed = await PackageUsed.find({ package: booking.package, user: user, booking: booking._id, car: booking.car }).count().exec();

                                    if (checkPackageUsed == 1) {
                                        await PackageUsed.remove({ package: booking.package, user: user, booking: booking._id, car: booking.car }).exec();
                                    }
                                }
                            }
                        }

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

                            var point = {
                                user: booking.user,
                                activity: "booking",
                                tag: "bookingCancelled",
                                points: 10,
                                status: true
                            }
                            fun.deductPoints(point);
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
                        if (booking.coupon) {
                            var checkCouponUsed = await CouponUsed.find({ user: user, booking: booking._id }).count().exec();
                            if (checkCouponUsed == 1) {
                                await CouponUsed.remove({ user: user, booking: booking._id }).exec();
                            }
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
        console.log("Appi  called")
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var total = 0;
        var labourCost = 0;
        var part_cost = 0;
        var bookingService = [];
        var services = req.body.services;
        var userType = await User.findOne({ _id: user }).exec();
        if (userType.account_info.type == "user") {
            var booking = await Booking.findOne({ _id: req.body.id, user: user, is_services: true }).exec();
            var status = "Pending"
        }
        else {
            var booking = await Booking.findOne({ _id: req.body.id, business: user, is_services: true }).exec();
            var status = "Confirmed"
        }

        if (booking) {
            var data = {
                date: new Date(req.body.date).toISOString(),
                time_slot: req.body.time_slot,
                status: status,
                updated_at: new Date()
            };

            await Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error occured",
                        responseData: {}
                    });
                    res.status(400).json(json)
                }
                else {
                    if (userType.account_info.type == "user") {
                        var notify = {
                            receiver: [booking.business],
                            activity: "booking",
                            tag: "bookingReschedule",
                            source: booking._id,
                            sender: user,
                            points: 0,
                            tz: req.headers['tz']
                        };
                        fun.newNotification(notify);
                    }
                    else {
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
                    }


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
        else {
            res.status(401).json({
                responseCode: 401,
                responseMessage: "Unauthorized",
                responseData: {},
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

router.get('/search', xAccessToken.token, async function (req, res, next) {

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

router.get('/analytic', xAccessToken.token, async function (req, res, next) {

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = decoded.user;
    var analytics = [];
    var paid_total = 0;
    var labour_cost = 0;
    var part_cost = 0;
    var date = new Date();
    if (req.query.type == "range") {
        var query = req.query.query;
        var ret = query.split("to");

        var from = new Date(ret[0]);
        var to = new Date(ret[1]);
    }

    else if (req.query.type == "period") {
        var query = parseInt(req.query.query);

        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    }
    else {
        var from = new Date(date.getFullYear(), date.getMonth(), 1);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    var totalBooking = await Booking.find({ business: business, is_services: true, status: { $ne: "Inactive" }, created_at: { $gte: from, $lte: to } }).count().exec();
    analytics.push({
        title: "Total Booking",
        count: totalBooking
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

    return res.status(200).json({
        responseCode: 200,
        responseMessage: "Success",
        responseData: analytics
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

    return res.status(200).json({
        responseCode: 200,
        responseMessage: "Packages",
        responseData: packages
    })
});


module.exports = router
