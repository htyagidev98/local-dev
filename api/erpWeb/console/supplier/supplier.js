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
var Log_Level = config.Log_Level

router.post('/vendor/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        contact_no: 'required',
        name: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Validation Error",
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
        var business = req.headers['business'];

        var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "business" }).count().exec();
        if (checkPhone == 0) {
            var otp = Math.floor(Math.random() * 90000) + 10000;

            req.body.username = shortid.generate();

            req.body.socialite = {};
            req.body.optional_info = {};

            var address = req.body.address;

            var country = await Country.findOne({ timezone: { $in: req.headers['tz'] } }).exec();

            req.body.address = {
                country: country.countryName,
                timezone: req.headers['tz'],
                location: req.body.location,
                address: req.body.address,
                state: req.body.state,
                zip: req.body.zip,
                country_code: req.body.country_code,

            };

            req.body.bank_details = {
                ifsc: req.body.ifsc,
                account_no: req.body.account_no,
                account_holder: req.body.account_holder
            };

            req.body.account_info = {
                type: "business",
                status: "Complete",
                added_by: business,
                phone_verified: false,
                verified_account: false,
                approved_by_admin: false,
            };

            req.body.geometry = [0, 0];

            req.body.device = [];
            req.body.otp = otp;
            req.body.uuid = uuidv1();

            req.body.business_info = {
                business_category: req.body.business_category,
                company_name: req.body.company,
                account_no: req.body.account_no,
                gst_registration_type: req.body.gst_registration_type,
                gstin: req.body.gstin,
                tax_registration_no: req.body.tax_registration_no,
                pan_no: req.body.pan_no,
                brand: req.body.carBrand,
            };

            var firstPart = (Math.random() * 46656) | 0;
            var secondPart = (Math.random() * 46656) | 0;
            firstPart = ("000" + firstPart.toString(36)).slice(-3);
            secondPart = ("000" + secondPart.toString(36)).slice(-3);
            req.body.referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();

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

                Management.create({
                    business: user._id,
                    user: user._id,
                    role: "Admin",
                    created_at: new Date(),
                    updated_at: new Date(),
                });


                BusinessVendor.create({
                    vendor: user._id,
                    business: business,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                })

                Address.create({
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
    }
});

router.get('/stocks/export', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = decoded.user;


    var product = [];

    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var product = [];
    var array = [];

    if (req.query.by == "category") {
        var query = {
            "$match": {
                category: mongoose.Types.ObjectId(req.query.query),
                business: mongoose.Types.ObjectId(business)
            }
        }
    }
    else if (req.query.by == "subcategory") {
        var query = { "$match": { subcategory: mongoose.Types.ObjectId(req.query.query) }, business: mongoose.Types.ObjectId(business) }
    }
    else if (req.query.by == "brand") {
        var query = { "$match": { product_brand: mongoose.Types.ObjectId(req.query.query), business: mongoose.Types.ObjectId(business) } }
    }
    else if (req.query.by == "model") {
        var query = { "$match": { product_model: mongoose.Types.ObjectId(req.query.query), business: mongoose.Types.ObjectId(business) } }
    }
    else if (req.query.by == "id") {
        var query = { "$match": { product: mongoose.Types.ObjectId(req.query.query), business: mongoose.Types.ObjectId(business), } }
    }
    else if (req.query.by == "filter") {

        var specification = {};
        var subcategory = req.query.subcategory;
        specification["business"] = business;
        array.push(specification);


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
            var specification = {};
            var models = req.query.car;
            specification['models'] = { $in: models.split(',') }
            array.push(specification);
        }

        var specification = {};
        var list_type = req.query.list_type;
        specification['list_type'] = { $in: list_type.split(',') }
        array.push(specification);


        var query = {
            "$match": {
                "$and": array
            }
        }
    }
    else {
        if (req.query.query) {
            req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        }

        var list_type = req.query.list_type;
        var query = {
            "$match": {
                business: mongoose.Types.ObjectId(business),
                list_type: { $in: list_type.split(',') },
                "$or": [
                    { type: { $regex: req.query.query, $options: 'i' } },
                    { models: { $regex: req.query.query, $options: 'i' } },
                    { title: { $regex: req.query.query, $options: 'i' } },
                    { part_no: { $regex: req.query.query, $options: 'i' } },
                    { keywords: { $regex: req.query.query, $options: 'i' } },
                    {
                        sku: {
                            $elemMatch: {
                                sku: { $regex: req.query.query, $options: 'i' }
                            }
                        }
                    },
                ]
            }
        }
    }

    await BusinessProduct.aggregate([
        query,
        { $sort: { "price.sell_price": -1 } },
    ])
        .allowDiskUse(true)
        .cursor({})
        .exec()
        .eachAsync(async function (p) {
            var title = p.title;
            if (_.includes(title, ',')) { title = title.replace(/,/g, ", ") }

            product.push({
                product: p.product,
                _id: p._id,
                id: p._id,
                product_brand: await ProductBrand.findById(p.product_brand).exec(),
                product_model: await ProductCategory.findById(p.product_model).exec(),
                category: await ProductCategory.findById(p.category).exec(),
                subcategory: await ProductCategory.findById(p.subcategory).exec(),
                business: p.business,
                title: title,
                price: p.price,
                stock: p.stock,
                part_no: p.part_no,
                hsn_sac: p.hsn_sac,
                tax: p.tax,
                tax_rate: p.tax_rate,
                sku: p.sku,
                specification: p.specification,
                product_id: p.product_id,
                short_description: p.short_description,
                long_description: p.long_description,
                thumbnail: p.preview,
                models: p.models,
                services: p.services,
                unit: p.unit,
                warranty: p.warranty,
                quantity: p.quantity,
            });
        });

    const totalProductCount = await BusinessProduct.aggregate([
        query,
        { $sort: { "price.sell_price": -1 } },
    ]).exec()

    const publishedProductCount = await BusinessProduct.count({ business: business, publish: true, list_type: { $in: ["Offline"] } }).exec();

    res.status(200).json({
        responseCode: 200,
        //responseQuery: query,
        responseMessage: "success",
        responseData: {
            total: totalProductCount.length,
            published: publishedProductCount,
            products: product,
        }
    })
});

router.get('/vendor/bills/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];

    var vendor = await User.findById(req.query.user).exec();
    if (vendor) {
        var bills = [];
        if (req.query.page == undefined) {
            var page = 0;
        } else {
            var page = req.query.page;
        }

        if (req.query.limit) {
            var limit = parseInt(req.query.limit);
        } else {
            var limit = 50;
        }

        await Purchase.find({ business: business, vendor: vendor._id, status: { $ne: "Deleted" } })
            .sort({ bill_no: -1 })
            .skip(limit * page).limit(limit)
            .cursor().eachAsync(async (p) => {
                bills.push({
                    _id: p._id,
                    id: p._id,
                    bill_no: p.bill_no,
                    reference_no: p.reference_no,
                    date: moment(p.date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    due_date: moment(p.due_date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    business: p.business,
                    total: p.total,
                    status: p.status,
                    created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
                });
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Sucesss",
            responseInfo: {
                totalResult: await Purchase.find({ business: business, vendor: vendor._id, status: { $ne: "Deleted" } }).count().exec()
            },
            responseData: bills
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Vendor not found",
            responseData: {}
        });
    }
});

router.put('/product/sku/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        product: 'required',
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
        var business = req.headers['business'];
        var product = [];
        var loggedInDetails = await User.findById(decoded.user).exec();
        var check = await BusinessProduct.find({ _id: req.body.product, business: business }).count().exec();
        if (check == 1) {
            BusinessProduct.findOneAndUpdate({
                _id: req.body.product,
                business: business,
                sku: {
                    $elemMatch: {
                        '_id': req.body.id
                    }
                }
            },
                {
                    $set: {
                        'sku.$.sku': req.body.sku,
                        'sku.$.total': req.body.total,
                        'sku.$.available': req.body.available,
                    }
                }, { new: false }, async function (err, doc) {
                    if (err) {
                        var json = ({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {}
                        });

                        res.status(400).json(json)
                    }
                    else {
                        var activity = {
                            user: loggedInDetails._id,
                            name: loggedInDetails.name,
                            stage: "SKU Update",
                            activity: "SKU Update SKU: " + req.body.sku + " Total: " + parseFloat(req.body.total.toFixed(2)) + " Available: " + parseFloat(req.body.available.toFixed(2)),
                        };

                        fun.productLog(req.body.product, activity);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully updated",
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
            });
        }
    }
});

router.put('/product/stock/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        product: 'required',
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
        var business = req.headers['business'];
        var product = [];
        var loggedInDetails = await User.findById(decoded.user).exec();
        var check = await BusinessProduct.find({ _id: req.body.product, business: business }).count().exec();
        if (check == 1) {
            var total = req.body.total;
            var available = req.body.available;

            BusinessProduct.findOneAndUpdate({
                _id: req.body.product,
                business: business,
            },
                {
                    $set: {
                        stock: {
                            total: parseFloat(total.toFixed(2)),
                            available: parseFloat(available.toFixed(2)),
                            consumed: parseFloat(total.toFixed(2)) - parseFloat(available.toFixed(2)),
                        }
                    }
                }, { new: false }, async function (err, doc) {
                    if (err) {
                        var json = ({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {}
                        });

                        res.status(400).json(json)
                    }
                    else {

                        var activity = {
                            user: loggedInDetails._id,
                            name: loggedInDetails.name,
                            stage: "Stock Update",
                            activity: "Stock Change Total: " + parseFloat(total.toFixed(2)) + " Available: " + parseFloat(available.toFixed(2)),
                        };

                        fun.productLog(req.body.product, activity);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Successfully updated",
                            responseData: {}
                        })
                    }
                });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Product not found",
                responseData: {}
            });
        }
    }
});

router.put('/product/update', xAccessToken.token, async function (req, res, next) {
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
        var business = req.headers['business'];
        var product = [];
        var check = await BusinessProduct.find({ _id: req.body.id, business: business }).count().exec();
        if (check == 1) {
            var data = {
                title: req.body.title,
                product: req.body.product,
                description: req.body.description,
                discount: req.body.discount,
                model_no: req.body.model_no,
                models: req.body.models,
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
                        .populate('thumbnails')
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
                                        models: p.models,
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
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

router.put('/vendor-info/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        user: 'required',
        name: 'required',
        contact_no: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "All field required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = await User.findById(req.body.user).exec();
        if (user) {
            var check = await User.findOne({ contact_no: req.body.contact_no, _id: { $ne: user._id }, "account_info.type": user.account_info.type, }).exec();

            if (check) {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Contact no already exist",
                    responseData: {}
                });
            }
            else {
                User.findOneAndUpdate({ _id: user._id }, {
                    $set: {
                        name: req.body.name,
                        contact_no: req.body.contact_no,
                        email: req.body.email,
                        "business_info.company_name": req.body.company_name,
                        "business_info.gstin": req.body.gstin,
                        updated_at: new Date()
                    }
                }, { new: false }, function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Error Occurred",
                            responseData: err,
                        })
                    }
                    else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "User details updated...",
                            responseData: {},
                        })
                    }
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User not found",
                responseData: {},
            })
        }
    }
});

router.post('/stock/import', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var not_inserted = [];
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, '/home/ubuntu/CarEager/uploads')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, uuidv1() + "." + file.originalname.split('.')[file.originalname.split('.').length - 1])
        }
    });

    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
                return callback(new Error('Wrong extension type'));
            }
            callback(null, true);
        }
    }).single('media');


    upload(req, res, function (err) {
        if (err) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Server Error",
                responseData: err
            })
        }

        if (!req.file) {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "No File Passed",
                responseData: {}
            })
        }

        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        }
        else {
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Error",
                responseData: {}
            })
        }

        exceltojson({
            input: req.file.path,
            output: null,
            lowerCaseHeaders: true
        }, async function (err, docs) {
            if (err) {
                return res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Error",
                    responseData: err
                });
            }
            else {
                var result = _.filter(docs, x => x.title != "");

                var invalid_data = _.filter(result, x => x.title == "" || x.part_no == "" || parseFloat(x.purchase_price) < 0 || parseFloat(x.selling_price) < 0 || parseFloat(x.tax_rate) <= 0 || x.total == "" || x.consumed == "" || x.available == "" || x.hsn_sac == "" || x.amount_is_tax == "" || x.unit == "");

                if (invalid_data.length > 0) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Unformatted Data! Please check & upload again.",
                        responseData: {}
                    });
                }
                else {
                    for (var i = 0; i < result.length; i++) {
                        var product = result[i];

                        var part_no = product.part_no;
                        part_no = part_no.replace(/,/g, ", ");
                        part_no = part_no.toUpperCase();

                        var businessProduct = await BusinessProduct.findOne({ part_no: part_no, unit: product.unit, business: business }).sort({ updated_at: -1 }).exec();

                        var margin_total = 0;
                        if (businessProduct) {
                            var tax = [];
                            var tax_info = await Tax.findOne({ rate: parseFloat(product.tax_rate), type: "GST" }).exec();
                            var rate = parseFloat(product.selling_price);
                            var amount = parseFloat(product.selling_price);
                            var tax_rate = tax_info.detail;
                            var base = amount

                            if (product.amount_is_tax == "exclusive") {
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
                                            })
                                        }
                                        else {
                                            var t = tax_on_amount * (tax_info.rate / 100);
                                            amount = amount + t;
                                            tax.push({
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                    }
                                }
                            }

                            if (product.amount_is_tax == "inclusive") {
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
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }
                                }
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: amount,
                                detail: tax
                            }


                            var sku = {
                                sku: product.sku,
                                total: parseFloat(product.total),
                                available: parseFloat(product.available),
                            };

                            var stock = {
                                total: parseFloat(product.total),
                                consumed: parseFloat(product.consumed),
                                available: parseFloat(product.available),
                            };

                            var list_type = [];
                            list_type = _.concat(businessProduct.list_type, "Offline", "Import");
                            list_type = _.uniq(list_type);

                            var models = [];
                            if (product.models) {
                                models = product.models.split(',')
                            }
                            models = _.concat(businessProduct.models, models);
                            models = _.uniq(models);

                            margin_total = amount - parseFloat(product.purchase_price);

                            var data = {
                                purchase: null,
                                purchases: [],
                                business: business,
                                product: businessProduct.product,
                                product_id: businessProduct.product_id,
                                part_no: businessProduct.part_no,
                                product_brand: businessProduct.product_brand,
                                product_model: businessProduct.product_model,
                                model: businessProduct.model,
                                category: businessProduct.category,
                                subcategory: businessProduct.subcategory,
                                title: _.startCase(_.lowerCase(businessProduct.title)),
                                short_description: businessProduct.short_description,
                                long_description: businessProduct.long_description,
                                thumbnail: businessProduct.thumbnail,
                                specification: businessProduct.specification,
                                hsn_sac: product.hsn_sac,
                                unit: product.unit,
                                quantity: parseFloat(product.total),
                                models: models,
                                stock: stock,
                                list_type: list_type,
                                sku: sku,
                                price: {
                                    mrp: parseFloat(product.purchase_price),
                                    rate: parseFloat(amount),
                                    amount: amount,
                                    sell_price: amount,
                                    margin_total: margin_total,
                                    margin: margin_total,
                                },
                                amount_is_tax: "inclusive",
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_type: "GST",
                                tax_info: tax_details,
                                created_at: new Date(),
                                updated_at: new Date()
                            };

                            BusinessProduct.create(data).then(async function (bp) { });
                        }
                        else {
                            var tax = [];
                            var tax_info = await Tax.findOne({ rate: parseFloat(product.tax_rate), type: "GST" }).exec();
                            var rate = parseFloat(product.selling_price);
                            var amount = parseFloat(product.selling_price);
                            var tax_rate = tax_info.detail;
                            var base = amount
                            /* if(product.margin){
                                 var margin = product.margin;
                                 margin = margin.toString();
                                 if(margin.indexOf("%")>=0)
                                 {
                                     margin = parseFloat(margin);
                                     if(!isNaN(margin) && margin>0)
                                     {
                                         margin_total = amount*(margin/100);
                                         amount = amount+margin_total
                                     }
                                 }
                                 else
                                 {
                                     margin_total = parseFloat(margin);
                                     amount = amount+margin_total
                                 }
                             }     */

                            if (product.amount_is_tax == "exclusive") {
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
                                            })
                                        }
                                        else {
                                            var t = tax_on_amount * (tax_info.rate / 100);
                                            amount = amount + t;
                                            tax.push({
                                                tax: tax_info.tax, tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                    }
                                }
                            }

                            if (product.amount_is_tax == "inclusive") {
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
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }
                                }
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: amount,
                                detail: tax
                            }

                            var sku = {
                                sku: product.sku,
                                total: parseFloat(product.total),
                                available: parseFloat(product.available),
                            };

                            var stock = {
                                total: parseFloat(product.total),
                                consumed: parseFloat(product.consumed),
                                available: parseFloat(product.available),
                            };

                            var list_type = ["Offline", "Import"];


                            var models = [];
                            if (product.models) {
                                models = product.models.split(',')
                            }

                            margin_total = amount - parseFloat(product.purchase_price);

                            var data = {
                                purchase: null,
                                purchases: [],
                                business: business,
                                product: null,
                                product_id: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                                part_no: part_no,
                                product_brand: null,
                                product_model: null,
                                model: null,
                                category: null,
                                subcategory: null,
                                title: _.startCase(_.lowerCase(product.title)),
                                short_description: "",
                                long_description: "",
                                thumbnail: "",
                                specification: "",
                                hsn_sac: product.hsn_sac,
                                quantity: parseFloat(product.total),
                                unit: product.unit,
                                models: models,
                                stock: stock,
                                sku: sku,
                                list_type: list_type,
                                price: {
                                    mrp: parseFloat(product.purchase_price),
                                    rate: parseFloat(amount),
                                    amount: amount,
                                    sell_price: amount,
                                    margin_total: margin_total,
                                    margin: margin_total,
                                },
                                amount_is_tax: "inclusive",
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_type: "GST",
                                tax_info: tax_details,
                                list_type: list_type,
                                created_at: new Date(),
                                updated_at: new Date()
                            };

                            BusinessProduct.create(data).then(async function (bp) {
                            });
                        }
                    }

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Successfully Import",
                        responseData: {}
                    });
                }
            }
        });
    });
});

let fetchParts = (parts) => {
    let partsPrices = []
    let newPrices = []
    // console.log('Booking', parts)
    parts.services.forEach(s => {
        s.parts.forEach(p => {

            p.rate = ''
            p.amount = '';
            partsPrices.push(p)
        })
    })
    return partsPrices
}

router.post('/vendor/order/placed', async (req, res, next) => {
    businessFunctions.logs("INFO: /vendor/order/placed Api Called from common.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    let vendor = []
    let vendorId = []
    let vendorName = Object.keys(req.body.vendors)

    let vendorArray = []
    let vendorOrderRef = {}
    // console.log("vendor Name", vendorName)
    let vendors = req.body.vendors
    let getUser = await User.findOne({ _id: mongoose.Types.ObjectId(user) }).exec()
    let quotationOrder = {
        business: '',
        car: '',
        booking: '',
        vendors: [],
        created_at: '',
        order_no: 0,
        status: ''
    }

    let createObject = {
        vendor: '',
        business: '',
        car: '',
        booking: '',
        parts: [],
        created_at: '',
        updated_at: '',
        order_link: '',
        shop_name: '',
        contact_no: '',
        email: '',
        totalQuotations: 0,
        status: '',
        quotation: '',
        order_no: 0
    }

    let logs = {
        business: '',
        booking: '',
        vendor: '',
        order: '',
        car: '',
        user: '',
        log: '',
        created_at: '',
        parts: [],
        orderDetails: [],
        quotation: ''
    }

    let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(req.body.booking) })
    let parts = await fetchParts(booking)

    quotationOrder.booking = booking._id
    quotationOrder.business = booking.business
    quotationOrder.car = booking.car
    quotationOrder.vendors = vendorName
    quotationOrder.created_at = new Date()
    quotationOrder.updated_at = new Date()
    quotationOrder.status = 'Requested'

    let totalQuotation = await QuotationOrders.find({}).exec()
    if (totalQuotation.length) {
        quotationOrder.order_no = totalQuotation.length
    } else {
        quotationOrder.order_no = 1
    }

    let newQuotation = await QuotationOrders.create(quotationOrder)

    //parts = assignParts(parts)

    vendorName.forEach(d => {
        // console.log("Your vendor id", d[0])
        vendorId.push(mongoose.Types.ObjectId(d))
    })
    //.populate({path: 'car', select: 'vin title manufacture_year'})
    let vendorQuery = { "_id": { $in: vendorId } }
    await User.find(vendorQuery)
        .populate({ path: "car", select: 'vin title manufacture_year' })
        .cursor()
        .eachAsync(async (v) => {
            let vendorDetails = {
                name: '',
                parts: []
            }

            vendorDetails.name = v.name
            vendorDetails.parts = vendors[v._id]
            vendorArray.push(vendorDetails)

            logs.booking = req.body.booking
            logs.business = business
            logs.vendor = v._id
            logs.car = booking.car
            logs.created_at = new Date()

            let getParts = createParts(vendors[v._id], parts)
            createObject.vendor = mongoose.Types.ObjectId(v._id)
            createObject.business = mongoose.Types.ObjectId(business)
            createObject.booking = mongoose.Types.ObjectId(req.body.booking)
            createObject.car = mongoose.Types.ObjectId(booking.car)
            createObject.parts = getParts
            createObject.created_at = new Date()
            createObject.updated_at = new Date()
            createObject.order_link = 'http://localhost:4200/'
            createObject.shop_name = v.name
            createObject.contact_no = v.contact_no
            createObject.email = v.email
            createObject.status = 'Requested'
            createObject.quotation = mongoose.Types.ObjectId(newQuotation._id)
            createObject.order_no = newQuotation.order_no
            let order = await VendorOrders.create(createObject)
            order.order_link = 'http://localhost:4200/vendors/orders?id=' + order._id
            vendorOrderRef = order
            logs.order = order._id
            await order.save()
            await whatsAppEvent.partsLink(v.contact_no, business, 'http://localhost:4200/vendors/orders?id=' + order._id)
            //await event.orderMail(order.email, order.order_link)
            vendor.push(order)
        })


    logs.log = 'Price Requested'
    logs.user = getUser.name
    logs.quotation = mongoose.Types.ObjectId(newQuotation._id)
    await OrderLogs.create(logs)
    res.json({
        parts: parts,
        partsLength: parts.length
    })
})

router.get('/vendor/order/get', async (req, res, next) => {
    businessFunctions.logs("INFO: /vendor/order/get Api Called from supplier.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    let booking = req.query.booking
    // console.log("Booking id..", booking)
    let getVendorOrders = await QuotationOrders.findOne({ booking: mongoose.Types.ObjectId(booking) })
        .exec()
    let userBooking = await Booking.findOne({ _id: mongoose.Types.ObjectId(booking) }).exec()
    let user = await User.findOne({ _id: mongoose.Types.ObjectId(userBooking.user) }).exec()
    let advisor = await User.findOne({ _id: mongoose.Types.ObjectId(userBooking.advisor) }).exec()


    if (getVendorOrders) {
        return res.json({
            order: getVendorOrders,
            booking: userBooking,
            user: user,
            advisor: advisor,
            responseCode: 200,
            responseMessage: "Orders found"
        })
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Vendor order Send in Response Successfully.");
        }
    } else {
        return res.json({
            order: {},
            booking: userBooking,
            user: user,
            advisor: advisor,
            responseCode: 404,
            responseMessage: "Order not found"
        })
    }
})


router.put('/manage/state', async (req, res, next) => {
    // console.log("State management Api")
    let quotation = req.body.quotation
    let quot = await VendorOrders.findOne({ _id: quotation }).exec()
    quot.status = 'Received'
    await quot.save()
    res.json({
        responseCode: '200',
        message: 'Status Changed'
    })
})

router.get('/all/business/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /all/business/get Api Called from supplier.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var loggedInDetails = await User.findById(decoded.user).exec();
    var product = new Object();
    var result = [];
    // console.log("Main ")
    // console.log("Business Id = " + business)
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
    var data = []
    let startDate = req.query.from
    let endDate = req.query.to
    let brand = req.query.brand
    // console.log(startDate, req.query.end_date)
    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

    }

    if (req.query.type == "business") {
        if (req.query.query) {
            // console.log("Query=  " + req.query.query)
            var query = {
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
                            // {
                            //     "business_info.gstin": { $regex: req.query.query, $options: 'i' }
                            // },
                            {
                                "address.location": { $regex: req.query.query, $options: 'i' }
                            },
                            {
                                "address.address": { $regex: req.query.query, $options: 'i' },
                            },
                        ]
                    }
                ]
            }
            // console.log(query + " Query")
        }

        else if (req.query.brand) {
            // console.log("active 1200= " + req.query.active)
            var query = {
                "account_info.type": "business",
                "visibility": true,
                _id: { $ne: mongoose.Types.ObjectId(business) },
                "business_info.brand": req.query.brand
            }


        }

        else if (req.query.location) {
            req.query.location = req.query.location.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

            // console.log("Location  = " + req.query.location)
            var query = {
                $and: [
                    {
                        "account_info.type": "business",
                        "visibility": true,
                        _id: { $ne: mongoose.Types.ObjectId(business) },
                        $or: [
                            {
                                "address.city": { $regex: req.query.location, $options: 'i' },
                            },
                            {
                                "address.zip": { $regex: req.query.location, $options: 'i' },
                            },
                            {
                                "address.address": { $regex: req.query.location, $options: 'i' },
                            },
                            // {
                            //     "address.state": new RegExp(req.query.location, "i"),
                            // },
                            // {
                            //     $text: { $search: req.query.query }
                            //     // "address.address": new RegExp(req.query.query, "i")
                            // },
                            // {
                            //     $elemMatch: { "address.address": req.query.query }
                            // },
                        ]
                    }
                ]
            }
            // console.log(query + " Query")
        } else if (req.query.active) {
            // console.log("active 1200= " + req.query.active)
            var query = {
                "account_info.type": "business",
                "visibility": true,
                _id: { $ne: mongoose.Types.ObjectId(business) },
                "account_info.status": req.query.active
            }
        }
        //APS OR AWS
        else if (req.query.category) {
            // console.log("Category")
            result = []
            // var busi = await BusinessPlan.find({ category: req.query.category }).populate('user').sort({ created_at: -1 }).exec();
            // return res.status(200).json(busi)
            totalResult = 0
            if (req.query.category != "others") {
                //console.log("APS AWS")
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Fatching Business and their Business Plan Details, Category:" + req.query.category + ", " + "User:" + loggedInDetails.name);
                }
                await BusinessPlan.find({ category: req.query.category, business: { $ne: mongoose.Types.ObjectId(business) } }).populate('business').sort({ created_at: -1 }).cursor().eachAsync(async (business) => {
                    // return res.status(200).json(business)
                    totalResult = totalResult + 1
                    // console.log(" Error doucument= " + business._id)
                    result.push({
                        _id: business.business._id,
                        id: business.business._id,
                        name: business.business.name,
                        email: business.business.email,
                        referral_code: business.business.referral_code,
                        contact_no: business.business.contact_no,
                        address: business.business.address,
                        bank_details: business.business.bank_details,
                        business_info: business.business.business_info,
                        account_info: business.business.account_info,
                        agent: business.business.agent,
                        partner: business.business.partner,
                        plans_details: [business],
                        created_at: moment(business.business.created_at).tz(req.headers['tz']).format('ll'),
                        updated_at: moment(business.business.created_at).tz(req.headers['tz']).format('ll'),
                    })



                });
                result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Sending Business and their Business Plan Details in Response, Category:" + req.query.category + ", " + "User:" + loggedInDetails.name);
                }
                return res.status(200).json({
                    responseCode: 200,
                    responseInfo: {
                        totalResult: totalResult
                    },
                    // responseQuery: query,
                    responseMessage: "success",
                    responseData: result
                });
            } else if (req.query.category == "others") {
                // console.log(" Others doucument= ")
                // var totalResult = await User.find(query).count();
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Fatching Business and their Business Plan Details, Category:" + req.query.category + ", " + "User:" + loggedInDetails.name);
                }
                await User.find({
                    "account_info.type": "business",
                    "visibility": true,
                    _id: { $ne: mongoose.Types.ObjectId(business) },
                })
                    // .skip(limit * page).limit(limit)
                    .sort({ created_at: -1 })
                    .cursor().eachAsync(async (p) => {
                        var busi = {}
                        var busi = await BusinessPlan.find({ business: p._id }).count().exec();
                        // console.log("isPlan = " + busi)
                        if (busi == 0) {
                            totalResult = totalResult + 1
                            // console.log("Inside If isPlan = ")
                            result.push({
                                _id: p._id,
                                id: p._id,
                                name: p.name,
                                email: p.email,
                                referral_code: p.referral_code,
                                contact_no: p.contact_no,
                                address: p.address,
                                bank_details: p.bank_details,
                                business_info: p.business_info,
                                account_info: p.account_info,
                                agent: p.agent,
                                partner: p.partner,
                                plans_details: [],
                                created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                                updated_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                            })
                        }

                    });
                result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Sending Business and their Business Plan Details in Response, Category:" + req.query.category + ", " + "User:" + loggedInDetails.name);
                }
                return res.status(200).json({
                    responseCode: 200,
                    responseInfo: {
                        totalResult: totalResult
                    },
                    // responseQuery: query,
                    responseMessage: "success",
                    responseData: result
                });
            }
        }
        //
        else if (startDate && endDate) {
            // console.log(startDate + "  = Date 1207 -" + endDate)
            // filters.push({ $match: {} }
            var query = {
                "account_info.type": "business",
                "visibility": true,
                _id: { $ne: mongoose.Types.ObjectId(business) },
                "created_at": { $gte: new Date(startDate), $lt: new Date(endDate) }
            }
        }
        else if (req.query.connection1) {
            // console.log("   Connection 1207 -" + req.query.connection)
            // await BusinessVendor.find({ business: business }).cursor().eachAsync(async (p) => {
            await BusinessVendor.find({}).cursor().eachAsync(async (p) => {
                list.push(mongoose.Types.ObjectId(p.vendor))
            })
            // filters.push({ $match: {} }
            var query = {
                // "account_info.type": "business",
                // "visibility": true,
                // _id: { $ne: mongoose.Types.ObjectId(business) },
                _id: { $in: list },
                // "created_at": { $gte: new Date(startDate), $lt: new Date(endDate) }
            }
        } else if (req.query.connection) {
            // console.log("   Connection 1207 -" + req.query.connection)
            totalResult = 0
            await BusinessVendor.find({ business: business }).populate('vendor').cursor().eachAsync(async (p) => {
                totalResult = totalResult + 1
                var busi = {}
                var busi = await BusinessPlan.find({ business: p.vendor._id }).exec();
                result.push({
                    _id: p.vendor._id,
                    id: p.vendor._id,
                    name: p.vendor.name,
                    email: p.vendor.email,
                    referral_code: p.vendor.referral_code,
                    contact_no: p.vendor.contact_no,
                    address: p.vendor.address,
                    bank_details: p.vendor.bank_details,
                    business_info: p.vendor.business_info,
                    account_info: p.vendor.account_info,
                    agent: p.vendor.agent,
                    partner: p.vendor.partner,
                    plans_details: busi,
                    created_at: moment(p.vendor.created_at).tz(req.headers['tz']).format('ll'),
                    updated_at: moment(p.vendor.created_at).tz(req.headers['tz']).format('ll'),
                })
            });
            result = await q.all(businessFunctions.removeDublicateDoumnets(result, "contact_no"));
            return res.status(200).json({
                responseCode: 200,
                responseInfo: {
                    totalResult: totalResult
                },
                responseQuery: query,
                responseMessage: "success",
                responseData: result
            });

            // filters.push({ $match: {} }

        }
        else {
            // console.log("Else 1216 ")
            var query = {
                "account_info.type": "business",
                "visibility": true,
                _id: { $ne: mongoose.Types.ObjectId(business) },
            }
        }
    }
    else {
        if (req.query.query) {
            // console.log("Query = " + req.query.query)
            var query = {
                $and: [
                    {
                        "account_info.type": "user",
                        $or: [
                            // {
                            //     "name": { $regex: req.query.query, $options: 'i' }
                            // },
                            // {
                            //     "contact_no": { $regex: req.query.query, $options: 'i' }
                            // },
                            // {
                            //     "business_info.gstin": { $regex: req.query.query, $options: 'i' }
                            // },
                            // {
                            //     $text: { $search: req.query.query }
                            //     // "address.address": new RegExp(req.query.query, "i")
                            // },
                            // // {
                            // //     $elemMatch: { "address.address": req.query.query }
                            // // },

                        ]
                    }
                ]
            }
            // console.log(query + " Query")
        }
        else {
            var query = {
                "account_info.type": "user"
            }
        }
    }


    var totalResult = await User.find(query).count();
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Users And their Business Plan Details, User:" + loggedInDetails.name);
    }
    await User.find(query)
        .skip(limit * page).limit(limit)
        .sort({ created_at: -1 })
        .cursor().eachAsync(async (p) => {
            var busi = {}
            var busi = await BusinessPlan.find({ business: p._id }).exec();
            // var vendorDetails = await BusinessPlan.find({ business: p._id }).exec();
            result.push({
                _id: p._id,
                id: p._id,
                name: p.name,
                email: p.email,
                referral_code: p.referral_code,
                contact_no: p.contact_no,
                address: p.address,
                bank_details: p.bank_details,
                business_info: p.business_info,
                account_info: p.account_info,
                agent: p.agent,
                partner: p.partner,
                plans_details: busi,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
                updated_at: moment(p.created_at).tz(req.headers['tz']).format('ll'),
            })
        });
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Users and their Business plan Details in Response, User:" + loggedInDetails.name);
    }
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
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Users and their Business plan Details send in Response Successfully, User:" + loggedInDetails.name);
    }

})

router.get('/cars/brand/get', /*xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /cars/brand/get Api called from supplier.js, Request Headers:" + JSON.stringify(req.headers))
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        businessFunctions.logs("ERROR:Validation failed")
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Error",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        console.time('looper')
        // var token = req.headers['x-access-token'];
        // var secret = config.secret;
        // var decoded = jwt.verify(token, secret);
        // var user = decoded.user;
        var data = [];
        // data=await Automaker.find({ maker: {$ne:null}}).exec()
        // await Automaker.find({
        //     maker: new RegExp(req.query.query, "i")

        // }).cursor()
        //     .eachAsync(async function (o) {
        //         data.push({
        //             _id: o._id,
        //             logo: o.logo,
        //             maker: o.maker,
        //         })
        //     });
        businessFunctions.logs("INFO: find cars brand from database")
        await Automaker.find({
            maker: { $ne: null }
        }).cursor()
            .eachAsync(async function (o) {
                data.push({
                    _id: o._id,
                    logo: o.logo,
                    maker: o.maker,
                })
            });
        console.timeEnd('looper')
        let field = 'maker';
        // console.log(data.sort((a, b) => (a[field] || "").toString().localeCompare((b[field] || "").toString())));
        data = data.sort((a, b) => (a[field] || "").toString().localeCompare((b[field] || "").toString()))
        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        })
        /**/
    }
});

// vinay code




router.put('/mark/order/delivered', async (req, res, next) => {
    businessFunctions.logs("INFO: /mark/order/delivered Api Called from supplier.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    let order = req.body.order
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Updating Order Status, orderId:" + req.body.order);
    }

    await BusinessOrder.findOneAndUpdate({ order: mongoose.Types.ObjectId(order) }, { status: 'Delivered' }).exec()

    res.json({
        message: "Order is Delivered"
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Order Successfully Delivered.");
    }
})

router.get('/vendor/order/get', async (req, res, next) => {
    businessFunctions.logs("INFO: /vendor/order/get Api Called from supplier.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    let booking = req.query.booking
    let vendorId = req.query.vendor
    let quotationId = req.query.quotationId
    // console.log("Booking id..", booking)
    let getVendorOrers = undefined
    let userBooking = undefined
    let advisor = undefined
    let user = undefined
    if (booking != "null") {
        getVendorOrders = await QuotationOrders.findOne({ booking: mongoose.Types.ObjectId(booking) })
            .exec()
        userBooking = await Booking.findOne({ _id: mongoose.Types.ObjectId(booking) })
            .populate("car")
            .exec()
        advisor = await User.findOne({ _id: mongoose.Types.ObjectId(userBooking.advisor) }).exec()
    } else {
        getVendorOrders = await QuotationOrders.findOne({ booking: mongoose.Types.ObjectId(quotationId) })
            .exec()
        user = await User.findOne({ _id: mongoose.Types.ObjectId(vendorId) }).exec()
    }

    let logs = PurchaseOrderLogs.find({ order: mongoose.Types.ObjectId(quotationId) }).exec()

    if (getVendorOrders) {
        return res.json({
            order: getVendorOrders,
            booking: userBooking,
            user: user,
            logs: logs,
            advisor: advisor,
            responseCode: 200,
            responseMessage: "Orders found"
        })
    } else {
        return res.json({
            order: {},
            booking: userBooking,
            user: user,
            logs: logs,
            advisor: advisor,
            responseCode: 404,
            responseMessage: "Order not found"
        })
    }
});

router.post('/direct/quotation/placed', async (req, res, next) => {
    // console.log("Body", req.body)
    let vendors = req.body.vendors
    await VendorOrders.find({ quotation: req.body.quotation })
        .cursor()
        .eachAsync(async (v) => {
            let selectedParts = vendors[v.vendor]
            let parts = v.parts

            for (let i = 0; i < parts.length; i++) {
                for (let j = 0; j < selectedParts.length; j++) {
                    if (selectedParts[j].part == v.parts[i].item) {
                        v.parts[i].partsStatus = "requested"
                        v.parts[i].lot = selectedParts[j].lot

                    }
                }
            }

            v.markModified("parts")
            v.save()
            // console.log("GetPArt...", selectedParts)

        })
    res.json({ message: "Parts saved" })
})

router.post('/add-part', async (req, res, next) => {
    // console.log("Add Part...", req.body)
    let part = req.body.part
    let vendor = req.body.vendor
    let quotation = req.body.quotation

    await VendorOrders.find({ quotation: mongoose.Types.ObjectId(quotation) })
        .cursor()
        .eachAsync(v => {
            part.partsStatus = 'requested'
            v.parts.push(part)
            v.markModified("parts")
            v.save()
        })

    //  let order = await VendorOrders.findOne({_id: mongoose.Types.ObjectId(vendor)}).exec()
    //  // console.log("PartsStatus..", order.parts[order.parts.length-1].partsStatus)
    //  order.parts[order.parts.length-1].partsStatus = "requested"

    // order.markModified('parts')
    //  order.save()

    res.json({
        message: "Part added"
    })

})

router.get('/get/bills', xAccessToken.token, async (req, res, next) => {
    businessFunctions.logs("INFO: /get/bills Api Called from supplier.js," + " " + "Request Headers:" + JSON.stringify(req.headers));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var loggedInDetails = await User.findById(decoded.user).exec();
    // stark sorting
    // console.log("Bill ")
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching all Bills with their details, User:" + loggedInDetails.name);
    }
    let bills = await Purchase.find({ business: mongoose.Types.ObjectId(business) })
        .populate({ path: "vendor" })
        .sort({ created_at: -1 })
        .exec();
    if (bills.length > 0) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Successfully get bills",
            responseData: {
                bills: bills
            },
            bills: bills
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Bill Details send in Response Successfully, User:" + loggedInDetails.name);
        }

    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: No Bill found for the Business, User:" + loggedInDetails.name);
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "No Bills Found",
            responseData: {},

        });
    }


})


//Abhinav Tygai to Create Quotation
router.post('/quotation/add', async (req, res, next) => {
    businessFunctions.logs("INFO: /quotation/add Api Called from supplier.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    // console.log("Api Called ")
    var status = req.body.status
    var quotations = req.body.quotations;
    var vendors = req.body.vendors;
    var quotationsPart = req.body.parts;
    // console.log("Parts = " + JSON.stringify(quotationsPart))
    let quotationId = req.body.quotationId
    var parts = [];
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (quotationId) {
        var data = []
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Quotation Request Details, QuotationId:" + quotationId + ", " + "User:" + loggedInDetails.name);
        }
        var quotation = await QuotationOrders.findOne({ _id: mongoose.Types.ObjectId(quotationId) }).exec()
        if (quotation) {

            // var quot = await QuotationOrders.findOne({ _id: quotationId }).exec();
            // for (var i = 0; i < quot.orders.length; i++) {
            //     quot.orders[i].parts.push(
            //         quotationsPart
            //     )
            // }
            // quot.markModified('orders')
            // quot.save();
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Fatching Vendors Details for that Quotation Request, QuotationId:" + quotationId + ", " + "User:" + loggedInDetails.name);
            }
            await VendorOrders.find({ quotation: mongoose.Types.ObjectId(quotationId) })
                .cursor()
                .eachAsync(async (order) => {
                    orderParts = order.parts;
                    orderParts.push(quotationsPart)
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG: Adding New Part in the Quotation, QuotationId:" + quotationId + ", " + "User:" + loggedInDetails.name);
                    }
                    await VendorOrders.findOneAndUpdate({ _id: order._id }, { $set: { parts: orderParts, updated_at: new Date() } }, { new: true }, async function (err, doc) {

                    })
                })
            var result = await VendorOrders.find({ quotation: quotationId })
                .populate({ path: 'quotation', select: 'created_at order_no' })
                .populate({ path: "vendor" })
                .exec();

            var activity = {
                business: business,
                activity: "Item Added- " + "Item: " + quotationsPart.item + " " + "Part_No: " + quotationsPart.part_no + " " + "Quantity: " + quotationsPart.quantity,
                activity_by: loggedInDetails.name,
                remark: "",
                created_at: new Date(),
            }

            businessFunctions.QuotationItemAddLog(quotationId, activity);
            return res.status(200).json({
                responseCode: 200,
                responseMessage: "Item Added Successfully",
                responseData: {
                    quotation: result,
                    quotationId: quotation._id,
                    quotationOrder: await QuotationOrders.findById(quotation._id).exec()
                },
                quotation: result
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Item Added Successfully, QuotationId:" + quotationId + ", " + "User:" + loggedInDetails.name);
            }
        } else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Quotation not found with the given QuotationId:" + quotationId + ", " + "User:" + loggedInDetails.name);
            }
            return res.status(422).json({
                responseCode: 422,
                responseMessage: "Quotation not found",
                responseData: {

                }
            });
        }
    } else {
        parts.push(quotationsPart);
        var count = await QuotationOrders.find({ business: business }).count();
        var activity = {
            business: business,
            activity: "Quotattion Created",
            activity_by: loggedInDetails.name,
            remark: "",
            created_at: new Date(),
        }

        // businessFunctions.QuotationItemAddLog(quotationId, activity);
        var quotationOrder = {
            business: business,
            car: null,
            booking: null,
            vendors: vendors,
            created_at: new Date(),
            updated_at: new Date(),
            order_no: count,
            status: 'created',
            logs: activity
        };
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Creating Quotation Request, User:" + loggedInDetails.name);
        }
        await QuotationOrders.create(quotationOrder).then(async function (quotation) {
            var last_order = ''
            var count = await QuotationOrders.find({ _id: { $lt: quotation._id }, business: business }).count();
            if (count == 0) {
                // console.log("If ")
                var last_order = "";
                var position = 1;
            }
            else {
                // console.log("ELSE " + count)
                var lq = await QuotationOrders.findOne({ _id: { $lt: quotation._id }, business: business }).sort({ _id: -1 }).exec();
                var last_order = lq.quotation_no;
                position = count + 1
            }
            // console.log("Lats Invoice  -= " + last_order)
            var fy = {
                with_tax: false,
                last_order: last_order,
                position: position,
                type: 'quotation'
            };
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: fun.fiscalyear(fy) function called from function.js.");
            }
            var assigned_quotation_no = await q.all(fun.fiscalyear(fy));
            if (assigned_quotation_no) {
                if (assigned_quotation_no.invoice) {
                    // console.log("Invoice no: " + assigned_invoice_no.invoice)
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG: Update Quotation Request Details, User:" + loggedInDetails.name);
                    }
                    await QuotationOrders.findOneAndUpdate({ _id: quotation._id }, { $set: { quotation_no: assigned_quotation_no.invoice } }, { new: true }, async function (err, doc) {
                        if (err) {
                            if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                businessFunctions.logs("ERROR: Error Occured while updating the quotation order details, QuotationId:" + quotation._id + ", " + "User:" + loggedInDetails.name);
                            }
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            // console.log("NO Assigned  = " + doc.quotation_no)
                        }
                    })
                }
            }
            var orderNo = await VendorOrders.find({ business: business }).count();







            let vendorQuery = { "_id": { $in: quotation.vendors } }
            var counter = 0;
            await User.find(vendorQuery)
                .populate({ path: "car", select: 'vin title manufacture_year' })
                .cursor()
                .eachAsync(async (v) => {

                    var car = null;
                    var booking = null;
                    if (req.body.booking) {
                        car = booking.car
                        booking = req.body.booking
                    }
                    var data = {
                        vendor: v._id,
                        business: business,
                        car: car,
                        booking: booking,
                        parts: parts,
                        // parts: quotationsPart,
                        order_link: 'http://localhost:4200/vendors/orders?id=',
                        shop_name: v.name,
                        contact_no: v.contact_no,
                        email: v.email,
                        totalQuotations: 0,
                        status: 'Created',
                        quotation: quotation._id,
                        order_no: orderNo + 1,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG: Creating Vendor Orders, User:" + loggedInDetails.name);
                    }

                    await VendorOrders.create(data).then(async function (order) {
                        await VendorOrders.findOneAndUpdate({ _id: order._id }, { $set: { order_link: 'http://localhost:4200/vendors/orders?id=' + order._id } }, { new: true }, async function (err, doc) {

                            //    for(var i=0;)
                            // quot.orders.push({
                            //     vendor: order.vendor,
                            //     parts: order.parts
                            // })
                            // quot.markModified('orders')
                            // quot.save();
                        });
                    })
                })
            var result = await VendorOrders.find({ quotation: quotation._id })
                .populate({ path: 'quotation', select: 'created_at order_no' })
                .populate({ path: "vendor" })
                .exec();
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Quotation Created Successfully",
                responseData: {
                    quotation: result,
                    quotationId: quotation._id,
                    quotationOrder: await QuotationOrders.findById(quotation._id).exec()
                }
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Quotation Created Successfully, QuotationId:" + quotation._id + ", " + "User:" + loggedInDetails.name);
            }

        })
    }
})


//Abhinav Tygai to Export Stock for tally
router.get('/tally/stocks/export', xAccessToken.token, async function (req, res, next) {
    console.log("1255 Abhinav Stock Export")
    try {
        console.log("Abhinav Stock Export")
        // const business = req.user;
        const business = req.headers['business'];
        if (req.query.page == undefined) {
            var page = 0;
        }
        else {
            var page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));
        let product = await BusinessProduct.aggregate([
            {
                $match: { business: mongoose.Types.ObjectId(business) }
            },
            {
                $group: {
                    _id: { title: '$title' },
                    title: { $last: '$title' },
                    part_no: { $last: '$part_no' },
                    basePrice: { $last: '$price.base' },
                    availableStok: { $sum: '$stock.available' },
                    hsn_sac: { $last: '$hsn_sac' },
                    tax_rate: { $last: '$tax_rate' },
                    long_description: { $last: '$long_description' },
                    unit: { $last: '$unit' },
                },
            },
            { $sort: { "title": 1 } },
        ]).exec()
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: {
                products: product,
            }
        })
    }
    catch (err) {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Internal Server error",
            responseData: {}
        })
    }

});

module.exports = router