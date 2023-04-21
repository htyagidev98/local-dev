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

var secret = config.secret;
var Log_Level = config.Log_Level

router.post('/signup', async function (req, res, next) {
    businessFunctions.logs("INFO:/signup Api called from business.js" + ", " + "Request Body:" + JSON.stringify(req.body))
    var rules = {
        contact_no: 'required',

    };
    //console.log("SIGNUP API -> erpWeb/business/business.js")
    var validation = new Validator(req.body, rules);
    //var business = req.headers['business'];
    req.body['whatsAppChannelId'] = '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2';
    // console.log("------" + req.body['whatsAppChannelId']);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR:Validation failed, Mobile Number is required")
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Mobile Number is required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        if (req.body.name) {
            var busuness_name = await User.find({ name: req.body.name }).count().exec();
        }
        else {
            var busuness_name = 0;
        }

        if (req.body.email) {
            var checkEmail = await User.find({ email: req.body.email }).count().exec();
        }
        else {
            var checkEmail = 0;
        }

        if (checkEmail) {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING:Email already in use-" + req.body.email)
            }
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Email already in use.",
                responseData: {},
            });
        } else if (busuness_name) {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING:Business name already taken-" + req.body.name)
            }
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Business name already taken.",
                responseData: {},
            });
        }
        else {
            // var checkUsername = await User.find({ username: req.body.name }).collation({ locale: 'en', strength: 2 }).exec();
            // if (checkUsername.length == 0) {
            //     var regexp = /^[a-zA-Z0-9._]+$/;
            //     var check = req.body.username;
            //     if (check.search(regexp) == -1) {
            //         res.status(422).json({
            //             responseCode: 422,
            //             responseMessage: "Use Only Alphabet, Numbers and dot & underscore",
            //             responseData: {},
            //         });
            //     }
            //     else {
            var checkPhone = await User.find({ contact_no: req.body.contact_no }).count().exec();
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
                    // country: country.countryName,
                    timezone: req.headers['tz'],
                    location: req.body.location,
                    address: address,
                    state: req.body.state,
                    city: req.body.city,
                    zip: req.body.zip,
                    area: req.body.area,
                    landmark: req.body.landmark,
                    country_code: req.body.country_code
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
                    is_password: true,

                };
                req.body.geometry = [0, 0];
                if (req.body.longitude && req.body.latitude) {
                    req.body.geometry = [req.body.longitude, req.body.latitude];
                }
                req.body.device = [];
                req.body.otp = otp;
                // console.log("Categotry = " + req.body.category,)
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
                    reg_by: req.body.name,
                }
                var started_at = null;
                if (req.body.started_at) {
                    started_at = new Date(req.body.started_at).toISOString()
                }

                var expired_at = null;
                if (req.body.expired_at) {
                    expired_at = new Date(req.body.expired_at).toISOString()
                }

                req.body.uuid = uuidv1();
                // var newhash = bcrypt.hashSync(req.body.password);
                // req.body.password = newhash

                await User.create(req.body).then(async function (user) {
                    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    // console.log("test")
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
                    await whatsAppEvent.autroidBusinessReg(user.name, user.contact_no, user._id);
                    var passwordData = {
                        password: bcrypt.hashSync(req.body.password)
                    }

                    await User.findOneAndUpdate({ _id: user._id }, { $set: passwordData }, { new: true }, async function (err, doc) {
                        if (err) {
                            var json = ({
                                responseCode: 400,
                                responseMessage: "Please Try Again",
                                responseData: err
                            });

                            res.status(400).json(json)
                        }
                        else {
                            var data = {
                                otp: otp,
                                account_info: {
                                    phone_verified: false,
                                    status: 'Active',
                                    approved_by_admin: false,
                                    verified_account: false,
                                    // added_by: user.account_info.added_by,
                                    type: "business",
                                    is_page: user.account_info.is_page,
                                }
                            };

                            User.findOneAndUpdate({ _id: user._id }, { $set: data }, function (err, doc) {

                            });
                        }
                    });
                    if (req.body.planCategory != "others") {
                        var freePlan = await SuitePlan.findOne({ plan: "Free", category: req.body.planCategory }).exec();

                        if (freePlan) {
                            var plans = await BusinessPlan.find({ business: user._id, suite: freePlan.id }).count().exec();
                            if (plans == 0) {
                                // console.log("Inside Plan = " + freePlan.id)
                                await SuitePlan.find({ _id: freePlan.id })
                                    .cursor().eachAsync(async (plan) => {
                                        if (plan) {
                                            var plan_no = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 10)
                                            // console.log("Plans detail" + plan, business._id)
                                            var expired_at = new Date();
                                            // var status = ""
                                            // if (plan.price - req.body.paid > 0) {

                                            //     status = "Pending"
                                            // } else if (plan.price - req.body.paid == 0) {


                                            var status = "Success"

                                            // }
                                            expired_at.setDate(expired_at.getDate() + plan.validity);
                                            BusinessPlan.create({
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
                                            TransactionLog.create({
                                                user: user._id,
                                                activity: "Business-Plan",
                                                status: "Purchase",
                                                received_by: "Self Registered",
                                                // source: plan._id,
                                                // source: plan[0]._id,
                                                source: user._id,
                                                plan_no: plan_no,
                                                // source: order_id,
                                                business: user._id,
                                                // paid_by: req.body.paid_by,
                                                paid_by: "Customer",
                                                // paid_total: req.body.paid,
                                                // paid_total: parseInt(req.body.paid),
                                                paid_total: plan.price,
                                                total: plan.price,
                                                // payment_mode: req.body.payment_mode,
                                                payment_mode: "Free Account",
                                                payment_status: "Success",
                                                order_id: null,
                                                // transaction_id: req.body.transaction_id,
                                                transaction_id: "free Account",
                                                transaction_date: new Date(),
                                                transaction_status: "Success",
                                                transaction_response: "Success",
                                                created_at: new Date(),
                                                updated_at: new Date(),
                                            })
                                        }
                                    });

                                // res.status(200).json({
                                //     responseCode: 200,
                                //     responseMessage: "Suite plans has been added.",
                                //     responseData: {}
                                // });
                                // console.log("Suite plans has been added.")
                            }
                            else {
                                // res.status(400).json({
                                //     responseCode: 400,
                                //     responseMessage: "Some Plans already active.",
                                //     responseData: {}
                                // });
                                // console.log("Some Plans already active.")
                            }
                        }
                    }
                    Management.create({
                        business: user._id,
                        user: user._id,
                        role: "Admin",
                        created_at: new Date(),
                        updated_at: new Date(),
                    });

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

                    event.autroidSignUpMail(user)
                    event.autroidSignUpSMS(user)
                    event.autroidOnboardings(user)
                    event.otpSms(user);
                    //sumit...
                    whatsAppEvent.welOnBoard(user.name, user.contact_no, user._id);





                    // Type.find({}).then(function(BT){
                    //     BT.forEach(function (u) {
                    //         var businessType = new BusinessType({
                    //             business: user._id,
                    //             business_type: u._id,
                    //             is_added: false,
                    //         });
                    //         businessType.save();
                    //     });
                    // });

                    //event.signupSMS(user);
                    //event.otpSms(user);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Business registered successfully",
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
        // }
        // else {
        //     res.status(422).json({
        //         responseCode: 422,
        //         responseMessage: "Username already in use.",
        //         responseData: {},
        //     });
        // }
        // }
    }
});

router.get('/revenue-fromCurrent/get', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO:/revenue-fromCurrent/get Api Called from business.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR : Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and getting date from query.");
        }
        var token = req.headers['x-access-token'];
        var business = req.headers['business']
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var leftDaysInMonth = date.getDate();
        var user = await User.findById(decoded.user).exec();
        //// console.log("leftDaysInMonth ==> ", leftDaysInMonth)
        var from = new Date()
        var to = new Date()
        var lastFrom = new Date()
        var lastTo = new Date()

        var analytics = [];
        var analyticsPre1 = [];
        var analyticsPre2 = [];
        var analyticsPre3 = [];
        req.query.query = 180
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), 1);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), 1);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        }
        else {
            var query = leftDaysInMonth;
            var from = new Date(date.getFullYear(), date.getMonth(), 1);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        var _1st_To = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
        var _1st_From = new Date(date.getFullYear(), date.getMonth() - 1, 1);

        var _2_To = new Date(date.getFullYear(), date.getMonth() - 2, date.getDate());
        var _2_From = new Date(date.getFullYear(), date.getMonth() - 2, 1);

        var _3_To = new Date(date.getFullYear(), date.getMonth() - 3, date.getDate());
        var _3_From = new Date(date.getFullYear(), date.getMonth() - 3, 1);

        var _4_To = new Date(date.getFullYear(), date.getMonth() - 4, date.getDate());
        var _4_From = new Date(date.getFullYear(), date.getMonth() - 4, 1);

        var _5_To = new Date(date.getFullYear(), date.getMonth() - 5, date.getDate());
        var _5_From = new Date(date.getFullYear(), date.getMonth() - 5, 1);

        var _6_To = new Date(date.getFullYear(), date.getMonth() - 6, date.getDate());
        var _6_From = new Date(date.getFullYear(), date.getMonth() - 6, 1);


        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        let totalRevenue = 0
        var totalParts = 0
        var totalLabour = 0
        var grossProfitThisMonth = 0
        count = 0
        // console.log("From Currnt abhiiii = " + from + " ,To current = " + to)
        var range = { $gte: from, $lt: to }
        //Current Month 
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Find revenue details From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Invoice.find({ business: business, status: "Active", created_at: { $gte: from, $lt: to } })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                totalRevenue = totalRevenue + labour_cost + part_cost + of_cost
                totalParts = totalParts + part_cost
                totalLabour = totalLabour + labour_cost

                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                // console.log("Month <31 = " + month)
                // }
                analytics.push({
                    total: labour_cost + part_cost + of_cost,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month,
                    // part_cost: part_cost,
                    // labour: labour_cost,
                    // of_cost: of_cost
                });
            });
        //Sales Order Revenue
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Find Sales order revenue details From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await OrderInvoice.find({ business: business, status: "Active", created_at: { $gte: from, $lt: to } })
            .cursor().eachAsync(async (invoice) => {

                totalRevenue = totalRevenue + invoice.payment.total;
                // console.log("Order  invoice= " + invoice._id + "total Order Revenue  " + invoice.payment.total)

                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');

                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                //     //  // console.log("Month <31 = " + month)
                // }
                var rev = invoice.payment.total;
                // console.log("Rev = " + rev)
                analytics.push({
                    total: rev,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });
        //
        //Expences Current Months
        var totalExpenceCost = 0
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Find Expenses details, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        // console.log("From Currnt = " + from + " ,To current = " + to)
        await Purchase.find({ created_at: { $gte: from, $lt: to }, business: business })
            .cursor().eachAsync(async (expence) => {
                // var expenceTotal = expence.total;
                // console.log(" expenceTotal ", expenceTotal)
                // count = count + 1
                totalExpenceCost = totalExpenceCost + expence.total;
            })
        // console.log("Purcahse Cost =" + totalExpenceCost)





        grossProfitThisMonth = parseFloat(totalRevenue) - parseFloat(totalExpenceCost)

        //
        var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        var booking = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Getting Total Leads || Bookings || Jobs details, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        var totalLeads = await Lead.find({ business: business, created_at: range }).count().exec()
        var totalBooking = await Booking.find({ is_services: true, business: business, status: { $in: booking }, created_at: range }).count().exec()
        var totalJob = await Booking.find({ is_services: true, business: business, status: { $in: jobsStatus }, created_at: range }).count().exec()
        var rating = await Review.find({ business: business, created_at: range }).exec();
        rating = _.meanBy(rating, (p) => p.rating);
        totalRating = parseFloat(rating.toFixed(1)),
            //
            //Current Month -1
            await Invoice.find({ business: business, status: "Active", created_at: { $gte: _1st_From, $lte: _1st_To } })
                .cursor().eachAsync(async (invoice) => {
                    var pick_up_charges = invoice.payment.pick_up_charges;
                    var policy_clause = invoice.payment.policy_clause;
                    var salvage = invoice.payment.salvage;

                    var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                    var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                    var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                    // totalRevenue = totalRevenue + labour_cost + part_cost + of_cost
                    var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                    // console.log("Month = " + month)
                    // if (duration <= 31) {
                    //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                    // }

                    analytics.push({
                        total: labour_cost + part_cost + of_cost,
                        sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month
                    });
                });
        await OrderInvoice.find({ business: business, status: "Active", created_at: { $gte: _1st_From, $lte: _1st_To } })
            .cursor().eachAsync(async (invoice) => {

                // totalRevenue = totalRevenue + invoice.payment.total;
                // console.log("Order  invoice= " + invoice._id + "total Order Revenue  " + invoice.payment.total)

                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');

                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                //     //  // console.log("Month <31 = " + month)
                // }
                var rev = invoice.payment.total;
                // console.log("Rev = " + rev)
                analytics.push({
                    total: rev,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });
        //Current Month -2 _2_To _2_From _3_To _3_From
        await Invoice.find({ business: business, status: "Active", created_at: { $gte: _2_From, $lte: _2_To } })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                // totalRevenue = totalRevenue + labour_cost + part_cost + of_cost
                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                // console.log("Month <31 = " + month)
                // }

                analytics.push({
                    total: labour_cost + part_cost + of_cost,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });
        await OrderInvoice.find({ business: business, status: "Active", created_at: { $gte: _2_From, $lte: _2_To } })
            .cursor().eachAsync(async (invoice) => {

                // totalRevenue = totalRevenue + invoice.payment.total;
                // console.log("Order  invoice= " + invoice._id + "total Order Revenue  " + invoice.payment.total)

                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');

                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                //     //  // console.log("Month <31 = " + month)
                // }
                var rev = invoice.payment.total;
                // console.log("Rev = " + rev)
                analytics.push({
                    total: rev,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });
        //Current Month -3
        await Invoice.find({ business: business, status: "Active", created_at: { $gte: _3_From, $lte: _3_To } })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                // totalRevenue = totalRevenue + labour_cost + part_cost + of_cost
                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                // console.log("Month <31 = " + month)
                // }

                analytics.push({
                    total: labour_cost + part_cost + of_cost,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });
        await OrderInvoice.find({ business: business, status: "Active", created_at: { $gte: _3_From, $lte: _3_To } })
            .cursor().eachAsync(async (invoice) => {

                // totalRevenue = totalRevenue + invoice.payment.total;
                // console.log("Order  invoice= " + invoice._id + "total Order Revenue  " + invoice.payment.total)

                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');

                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                //     //  // console.log("Month <31 = " + month)
                // }
                var rev = invoice.payment.total;
                // console.log("Rev = " + rev)
                analytics.push({
                    total: rev,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });
        await Invoice.find({ business: business, status: "Active", created_at: { $gte: _4_From, $lte: _4_To } })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                // totalRevenue = totalRevenue + labour_cost + part_cost + of_cost
                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                // console.log("Month <31 = " + month)
                // }

                analytics.push({
                    total: labour_cost + part_cost + of_cost,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });
        await OrderInvoice.find({ business: business, status: "Active", created_at: { $gte: _4_From, $lte: _4_To } })
            .cursor().eachAsync(async (invoice) => {

                // totalRevenue = totalRevenue + invoice.payment.total;
                // console.log("Order  invoice= " + invoice._id + "total Order Revenue  " + invoice.payment.total)

                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');

                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                //     //  // console.log("Month <31 = " + month)
                // }
                var rev = invoice.payment.total;
                // console.log("Rev = " + rev)
                analytics.push({
                    total: rev,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });
        await Invoice.find({ business: business, status: "Active", created_at: { $gte: _5_From, $lte: _5_To } })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                // totalRevenue = totalRevenue + labour_cost + part_cost + of_cost
                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                // console.log("Month <31 = " + month)
                // }

                analytics.push({
                    total: labour_cost + part_cost + of_cost,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });
        await OrderInvoice.find({ business: business, status: "Active", created_at: { $gte: _5_From, $lte: _5_To } })
            .cursor().eachAsync(async (invoice) => {

                // totalRevenue = totalRevenue + invoice.payment.total;
                // console.log("Order  invoice= " + invoice._id + "total Order Revenue  " + invoice.payment.total)

                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');

                // console.log("Month = " + month)
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                //     //  // console.log("Month <31 = " + month)
                // }
                var rev = invoice.payment.total;
                // console.log("Rev = " + rev)
                analytics.push({
                    total: rev,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });


        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Successfully get Total Leads || Bookings || Jobs details for different time periods," + " " + "User:" + user.name);
        }

        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            revenu: parseInt(_.sumBy(objs, 'total')),
            month: key,
            total: objs.length,
        })
        ).value();
        // analyticsPre3 = _.orderBy(analyticsPre3, ['sort'], ['asc'])
        // var data3 = _(analyticsPre3).groupBy('month').map((objs, key) => ({
        //     revenu: parseInt(_.sumBy(objs, 'total')),
        //     month: key,
        //     total: objs.length,
        // })
        // ).value();
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Sending Response," + " " + "User:" + user.name);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                // query: { $gt: from, $lt:to } 
                toalRevenue: parseFloat(totalRevenue).toFixed(2),
                totalParts: totalParts,
                totalLabour: totalLabour,
                grossProfit: grossProfitThisMonth.toFixed(2),
                totalLeads: totalLeads,
                totalBooking: totalBooking,
                totalJob: totalJob,
                //   rating: rating,
                totalRating: totalRating
            },
            responseData: data
            //  {
            //     currentMonth: data,
            //     Pre1stMonth: data1,
            //     preSencondMonth: data2,
            //     preThirdMonth: data3,

            // }
        });
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Api Worked Successfully.");
        }
    }
});
router.get('/totalStock/value/get', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /totalStock/value/get Api Called from business.js," + " " + "Request Headers:" + JSON.stringify(req.headers));
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();
    var totalStockValue = 0
    var count = 0;

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Find Available Stock Value, " + " " + "User:" + user.name);
    }
    await BusinessProduct.find({ "stock.available": { $gt: 0 }, business: business, })
        .cursor().eachAsync(async (stock) => {
            var stockCost = 0;
            count = count + 1
            // console.log(" stock.price.purchase_price ", stock.price.purchase_price)
            if (stock.price.purchase_price) {
                stockCost = stock.stock.available * stock.price.purchase_price
                // console.log("stockCost ", stockCost)
            }
            else {
                stockCost = stock.stock.available * stock.price.mrp
                // console.log("stockCost from else ", stockCost)
            }
            // console.log("count ,", count)
            totalStockValue = totalStockValue + stockCost;
        })
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Total Stock Value in Response.");
    }
    res.status(200).json({
        responseCode: 200,
        responseData: {
            totalStockValue: totalStockValue.toFixed(2)
        }
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Response Sends Successfully," + " " + "Total Stock:" + totalStockValue.toFixed(2) + " " + "User:" + user.name);
    }


});
router.get('/all-business/counts/get', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO:/all-business/counts/get Api Called from business.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        // from: 'required',
        // to: 'required'
        query: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR :Validation failed, Date are required.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        req.headers['x-access-token var token = '];
        // var secret = config.secret;
        // var decoded = jwt.verify(token, secret);
        // var user = decoded.user;
        var date = new Date();
        var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
        var analyticsBooking = [];
        var bookingAll = [];
        var jobsAll = [];
        var lastStartDate = new Date();
        var lastEndDate = new Date();
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - 1);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query - 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);

        var lastMonthRange = { $gte: lastStartDate, $lte: lastEndDate }
        // console.log("Lead Psf Rating Date from = " + from)
        var range = { $gte: from, $lte: to };
        var totalBooking = 0
        var totalJob = 0

        var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        var booking = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Getting Total Leads || Bookings || Jobs || Counts, From Date:" + from + "-" + "To:" + to);
        }
        var totalLeads = await Lead.find({ business: business, updated_at: range }).count().exec()

        var totalBooking = await Booking.find({ is_services: true, business: business, status: { $in: booking }, updated_at: range }).count().exec()
        var totalJob = await Booking.find({ is_services: true, business: business, status: { $in: jobsStatus }, updated_at: range }).count().exec()
        var totalBookingLast = await Booking.find({ is_services: true, business: business, status: { $in: booking }, updated_at: lastMonthRange }).count().exec()
        var totalJobLast = await Booking.find({ is_services: true, business: business, status: { $in: jobsStatus }, updated_at: lastMonthRange }).count().exec()
        var rating = await Review.find({ business: business }).exec();
        rating = _.meanBy(rating, (p) => p.rating);
        totalRating = parseFloat(rating.toFixed(1)),
            res.status(200).json({
                responseCode: 200,

                responseData: {
                    totalBooking: totalBooking,
                    totalJob: totalJob,
                    totalBookingLast: totalBookingLast,
                    totalJobLast: totalJobLast,
                    totalRating: totalRating,
                    totalLeads: totalLeads
                }
            });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO :Response Send Successfully.");
        }
        // //// console.log("response", responseData)
    }
});


router.get('/labour/revenue/get', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /labour/revenue/get Api Called from business.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR : Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
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
        var date = new Date();
        var business = req.headers['business']

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var analyticsRevenue = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Validated successfully and find date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalRevenue = 0
        var totalLabourCost = 0



        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Find Labour Cost, From Date:" + from + "-" + "To:" + to);
        }

        await Invoice.find({ created_at: { $gte: from, $lte: to }, status: "Active", business: business })
            .cursor().eachAsync(async (invoice) => {
                var labourCost = invoice.payment.labour_cost;
                // console.log(" labourCost ", labourCost)
                count = count + 1
                totalLabourCost = totalLabourCost + invoice.payment.labour_cost;
                var month = moment(invoice.updated_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(invoice.updated_at).tz(req.headers['tz']).format('MMM DD');

                }
                analytics.push({
                    labourCost: labourCost,
                    sort: moment(invoice.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });

            });



        analytics = _.orderBy(analytics, ['sort'], ['asc'])

        var labourData = _(analytics).groupBy('month').map((objs, key) => ({
            labourCost: parseInt(_.sumBy(objs, 'labourCost')),
            month: key,
            total: objs.length,
        })
        ).value();


        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Sending Response, Total Labour Cost:" + parseFloat(totalLabourCost).toFixed(0));
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: {

                totalLabourCost: parseFloat(totalLabourCost).toFixed(0)
            },
            responseData: {

                labourRevenue: labourData,
            }
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO :Response Sends Successfully, Total Labour Cost:" + parseFloat(totalLabourCost).toFixed(0));
        }
    }

});

router.get('/parts/profit/get', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /parts/profit/get Api Called from business.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
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
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var analyticsRevenue = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalPartCost = 0

        var partsProfit = 0

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Getting Total Parts Cost, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Invoice.find({ status: "Active", created_at: { $gte: from, $lte: to }, business: business })
            .cursor().eachAsync(async (invoice) => {
                var thisProfit = 0
                // var partCost = invoice.payment.part_cost;
                // console.log(" partCost ", partCost)
                // count = count + 1
                // totalPartCost = totalPartCost + invoice.payment.part_cost;
                var serviceses = invoice.services.length
                // console.log("serviceses " + serviceses)
                // console.log("Id  = " + invoice._id)
                for (var i = 0; i < serviceses; i++) {

                    // console.log("TOtal Parts  >> " + invoice.services[i].parts.length)


                    for (var j = 0; j < invoice.services[i].parts.length; j++) {

                        var base = invoice.services[i].parts[j].base
                        var amount = invoice.services[i].parts[j].amount
                        var profit = amount - base

                        totalPartCost = totalPartCost + profit
                        thisProfit = thisProfit + profit
                        // console.log("Base = ", base, "amount = " + amount + "Profit= " + profit, "   =Service id= " + invoice.services[i]._id)
                    }

                }

                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');

                }
                analytics.push({
                    thisProfit: thisProfit,
                    sort: moment(invoice.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });

            });



        analytics = _.orderBy(analytics, ['sort'], ['asc'])

        var partCostData = _(analytics).groupBy('month').map((objs, key) => ({
            partCost: parseInt(_.sumBy(objs, 'thisProfit')),
            month: key,
            total: objs.length,
        })
        ).value();


        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Response," + " " + "Total Part Cost:" + totalPartCost);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: {

                totalPartCost: parseFloat(totalPartCost).toFixed(0)
            },
            responseData: {

                partsProfit: partCostData,
            }
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Response Sends Successfully," + " " + "Total Part Cost:" + totalPartCost);
        }
    }

});

router.get('/revenue/plus/expence/get', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /revenue/plus/expence/get Api Called from business.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
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
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var analyticsRevenue = [];
        var lastFrom = new Date()

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);

            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalRevenue = 0
        var totalExpenceCost = 0
        // console.log("Revenue  Start  Date = " + from + "\nEnd Date= " + to)
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Getting Revenue and Expenses, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Invoice.find({ business: business, status: "Active", created_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                // totalRevenue = totalRevenue + labour_cost + part_cost + of_cost

                totalRevenue = totalRevenue + invoice.payment.total
                // console.log(" invoice= " + invoice._id + "totalRevenue " + totalRevenue)

                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');

                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                    //  // console.log("Month <31 = " + month)
                }
                // var rev = labour_cost + part_cost + of_cost
                var rev = invoice.payment.total
                // console.log("Rev = " + rev)
                analytics.push({
                    total: rev,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });

        await OrderInvoice.find({ business: business, status: "Active", created_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (invoice) => {
                totalRevenue = totalRevenue + invoice.payment.total;
                // console.log("Order  invoice= " + invoice._id + "total Order Revenue  " + invoice.payment.total)
                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                    //  // console.log("Month <31 = " + month)
                }
                var rev = invoice.payment.total;
                // console.log("Rev = " + rev)
                analytics.push({
                    total: rev,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Getting Expenses details, From date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Purchase.find({ created_at: { $gte: from, $lte: to }, status: "Completed", business: business })
            .cursor().eachAsync(async (expence) => {
                var expenceTotal = expence.total;
                if (expenceTotal > 50000) {
                    // console.log(" expenceTotal ", expenceTotal + " Puchase Id= " + expence._id)

                }
                count = count + 1
                totalExpenceCost = totalExpenceCost + expence.total;
                var month = moment(expence.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(expence.created_at).tz(req.headers['tz']).format('MMM DD');

                }

                analytics.push({
                    expenceTotal: expenceTotal,
                    sort: moment(expence.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            })

        analytics = _.orderBy(analytics, ['sort'], ['asc'])

        // for (var i = 0; i < analytics.length; i++) {

        //     // totalGrossprofit = parseInt(totalGrossprofit) + parseInt(data[i].revenu) - parseInt(data[i].expenceTotal)
        // console.log("Reve = " + data[i].revenu + " Exp = " + data[i].expenceTotal + " Gross= " + totalGrossprofit)
        //     // tp = parseInt(tp) + parseInt(data[i].grossProfit)
        //     // console.log("Reve = " + data[i].revenu + " Exp = " + data[i].expenceTotal + " Gross= " + totalGrossprofit + "  Tp = " + tp)
        // console.log("tp " + "Idex = " + i + " =" + tp)
        // console.log(" Index " + i + "Reve = " + analytics[i].total + "   Expe = " + analytics[i].expenceTotal)

        // console.log("totalGrossprofit ", totalGrossprofit)
        // }  
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            revenu: parseFloat(_.sumBy(objs, 'total')).toFixed(0),
            expenceTotal: parseFloat(_.sumBy(objs, 'expenceTotal')).toFixed(0),
            month: key,
            // total: objs.length,
            grossProfit: parseFloat(_.sumBy(objs, 'total')).toFixed(0) - parseFloat(_.sumBy(objs, 'expenceTotal')).toFixed(0)

        })
        ).value();
        var totalGrossprofit = 0;
        var total_rev = 0
        var tp = 0
        var total_Exp = 0;
        // console.log("data Lenght ", data.length)
        for (var i = 0; i < data.length; i++) {

            // totalGrossprofit = parseInt(totalGrossprofit) + parseInt(data[i].revenu) - parseInt(data[i].expenceTotal)
            // console.log("Reve = " + data[i].revenu + " Exp = " + data[i].expenceTotal + " Gross= " + totalGrossprofit)
            // console.log(" Exp = " + data[i].expenceTotal)
            if (data[i].revenu) {
                // console.log(" Rev = " + data[i].revenu)
                total_rev = total_rev + data[i].revenu
                // console.log("Data Rev = " + total_rev)
            }
            if (data[i].expenceTotal) {
                // console.log(" Rev = " + data[i].expenceTotal)
                total_Exp = total_Exp + data[i].expenceTotal
                // console.log("Data total_Exp = " + total_Exp)

            }
            // tp = parseInt(tp) + parseInt(data[i].grossProfit)
            // console.log("Reve = " + data[i].revenu + " Exp = " + data[i].expenceTotal + " Gross= " + totalGrossprofit + "  Tp = " + tp)
            // console.log("tp " + "Idex = " + i + " =" + tp)
            // console.log("totalGrossprofit ", totalGrossprofit)
        }
        // console.log("totalGrossprofit ", totalGrossprofit)
        // console.log("totalINter ", tp)
        totalGrossprofit = total_rev - total_Exp
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Total Expenses || Total Revenue || Total Gross Profit in Response" + ", " + "User:" + user.name);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: {

                totalExpenceCost: parseFloat(totalExpenceCost).toFixed(0),
                totalRevenue: parseFloat(totalRevenue).toFixed(0),
                // totalGrossprofit: totalGrossprofit.toFixed(2)
                totalGrossprofit: parseFloat(totalRevenue).toFixed(0) - parseFloat(totalExpenceCost).toFixed(0)
            },
            responseData: data
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Response Sends Successfully," + " " + "Total Expenses:- " + parseFloat(totalExpenceCost).toFixed(0) + ", " + "Total Revenue:" + parseFloat(totalRevenue).toFixed(0) + ", " + "Total Gross Profit:" + parseFloat(totalRevenue).toFixed(0) - parseFloat(totalExpenceCost).toFixed(0) + ", " + "User:" + user.name);
        }
    }

});

//XLX file of All Invoices 
router.get('/invoice/services/xls', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
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
        var date = new Date();
        var business = req.headers['business']

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var analyticsRevenue = [];
        var lastFrom = new Date()

        req.query.query = 365
        // req.query.query = 30
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);

            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalRevenue = 0
        var totalExpenceCost = 0
        // console.log("Revenue  Start  Date = " + from + "\nEnd Date= " + to)
        var sevicesData = []
        await Invoice.find({ business: business, status: "Active", created_at: { $gte: from, $lte: to } })
            .populate({ path: 'user', select: 'name contact_no email' })
            .populate({ path: 'car', select: 'title segment' })
            // .select('services labours parts')
            .cursor().eachAsync(async (invoice) => {

                count += 1
                var services = '';
                var parts = '';
                var labours = '';

                // if (invoice.services.length > 0) {
                //     invoice.services.forEach(element => {
                //         services = element.service + ", "
                //         console.log("Parts Length = " + element.parts.length)
                //         element.parts.forEach(part => {
                //             parts = part.item + ", "

                //             // for
                //         });
                //         element.labour.forEach(labour => {
                //             labours = labour.item + ", "

                //             // for
                //         });
                //     });
                // }

                if (invoice.services.length > 0) {
                    for (var i = 0; i < invoice.services.length; i++) {
                        services = services + invoice.services[i].service + ", ";

                        // console.log("Parts Length = " + invoice.services[i].parts.length)
                        for (var k = 0; k < invoice.services[i].parts.length; k++) {
                            parts = parts + invoice.services[i].parts[k].item + ", "
                        }
                        for (var l = 0; l < invoice.services[i].labour.length; l++) {
                            labours = labours + invoice.services[i].labour[l].item + ", "
                        }
                    }
                }

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                sevicesData.push({
                    party: invoice.user.name,
                    service: services,
                    parts: parts,
                    labours: labours,
                    car: invoice.car,
                    date: moment(invoice.created_at).tz(req.headers['tz']).format('lll'),
                    amount: invoice.payment.total
                    // amount: labour_cost + part_cost + of_cost
                })
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: { count: count },
            responseData: sevicesData
        });
    }

});
//XLX file of Invoices (Only Periodic Services) 
router.get('/invoice/periodic/services/xls', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR : Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
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
        var date = new Date();
        var business = req.headers['business']

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var analyticsRevenue = [];
        var lastFrom = new Date()

        req.query.query = 365
        // req.query.query = 30
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);

            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalRevenue = 0
        var totalExpenceCost = 0
        // console.log("Revenue  Start  Date = " + from + "\nEnd Date= " + to)
        var sevicesData = []
        await Invoice.find({
            business: business,
            status: "Active",
            'services.service': { $in: ['Basic Service (Normal Oil)', 'Basic Service (Synthetic Oil)', 'Basic Service (Fully-Synthetic Oil)', 'Pro Service (Normal Oil)', 'Pro Service (Synthetic Oil)', 'Pro Service (Fully-Synthetic Oil)', 'Ultimate Service (Normal Oil)', 'Ultimate Service (Synthetic Oil)', 'Ultimate Service (Fully-Synthetic Oil)'] },
            created_at: { $gte: from, $lte: to }
        })
            .populate({ path: 'user', select: 'name contact_no email' })
            .populate({ path: 'car', select: 'title segment _id' })

            // .select('services labours parts')
            .cursor().eachAsync(async (invoice) => {

                count += 1
                var services = '';
                var parts = '';
                var labours = '';

                // if (invoice.services.length > 0) {
                //     invoice.services.forEach(element => {
                //         services = element.service + ", "
                //         console.log("Parts Length = " + element.parts.length)
                //         element.parts.forEach(part => {
                //             parts = part.item + ", "

                //             // for
                //         });
                //         element.labour.forEach(labour => {
                //             labours = labour.item + ", "

                //             // for
                //         });
                //     });
                // }
                var periodicRevenue = 0
                if (invoice.services.length > 0) {
                    for (var i = 0; i < invoice.services.length; i++) {
                        // periodicRevenue = 0;
                        if (invoice.services[i].service == 'Basic Service (Normal Oil)' || invoice.services[i].service == 'Basic Service (Synthetic Oil)' || invoice.services[i].service == 'Basic Service (Fully-Synthetic Oil)' || invoice.services[i].service == 'Pro Service (Normal Oil)' || invoice.services[i].service == 'Pro Service (Synthetic Oil)' || invoice.services[i].service == 'Pro Service (Fully-Synthetic Oil)' || invoice.services[i].service == 'Ultimate Service (Normal Oil)' || invoice.services[i].service == 'Ultimate Service (Synthetic Oil)' || invoice.services[i].service == 'Ultimate Service (Fully-Synthetic Oil)') {
                            services = services + invoice.services[i].service + ", ";

                            // console.log("Parts Length = " + invoice.services[i].parts.length)
                            for (var k = 0; k < invoice.services[i].parts.length; k++) {
                                parts = parts + invoice.services[i].parts[k].item + ", "
                            }
                            for (var l = 0; l < invoice.services[i].labour.length; l++) {
                                labours = labours + invoice.services[i].labour[l].item + ", "
                            }
                            periodicRevenue = periodicRevenue + parseFloat(invoice.services[i].cost);
                        }
                    }
                    // invoice.services.forEach(element => {
                    //     services = element.service + ", "
                    //     console.log("Parts Length = " + element.parts.length)
                    //     element.parts.forEach(part => {
                    //         parts = part.item + ", "

                    //         // for
                    //     });
                    //     element.labour.forEach(labour => {
                    //         labours = labour.item + ", "

                    //         // for
                    //     });
                    // });
                }


                sevicesData.push({
                    party: invoice.user.name,
                    service: services,
                    periodicRevenue: periodicRevenue,
                    parts: parts,
                    labours: labours,
                    amount: invoice.payment.total,
                    car: invoice.car,
                    date: moment(invoice.created_at).tz(req.headers['tz']).format('lll'),
                    invoice: invoice._id
                })
            });
        res.status(200).json({
            responseCode: 200,
            responseMessage: { count: count },
            responseData: sevicesData
        });
    }

});
//Update Car's MIssing Segments From Variants
router.put('/cars/segment/update', /* xAccessToken.token,*/ async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var date = new Date();
    var business = req.headers['business'];
    var isSegment = 0;
    var isNotSegment = 0;

    await Car.find({ segment: { $nin: ['Sports', 'Luxury XL', 'Luxury', 'Premium XL', 'Premium', 'Medium', 'Small'] } })
        .populate({ path: 'variant', select: 'segment' })
        // .populate({ path: 'car', select: 'title segment _id' })
        .select('segment variant')
        .cursor().eachAsync(async (car) => {

            // console.log("Car Segment  = " + car.segment)
            if (!car.segment) {
                isNotSegment += 1
                // console.log("IF Car Segment  = " + car.segment)
                if (car.variant) {
                    // console.log("IF Variant Segment  = " + car.variant.segment)
                    await Car.findOneAndUpdate({ _id: car._id }, { $set: { segment: car.variant.segment } }, { new: true }, async function () {
                    })
                } else {
                    console.log("IF Variant Segment Not Found = " + car._id)
                }
            } else {
                isSegment += 1
                // console.log("ELSE Car Segment  = " + car.segment)
            }
        });
    res.status(200).json({
        responseCode: 200,
        responseMessage: { isSegment: isSegment, isNotSegment: isNotSegment },
        responseData: {}
    });
});
router.get('/last-period/counts/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var token = req.headers['x-access-token'];
        var business = req.headers['business'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var user = await User.findById(decoded.user).exec();
        // var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
            // console.log("lastEndDate 11 ", lastEndDate)
            // console.log("lastStartDate 11 ", lastStartDate)
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - 1);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query - 1);
            // console.log("Last month data end date = ", lastEndDate)
            // console.log("Last month data start = ", lastStartDate)
            // console.log("from this month data start = ", from)
            // console.log("to this month data start = ", to)
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var lastEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var lastStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query - query);
            // console.log("lastEndDate 33 ", lastEndDate)
            // console.log("lastStartDate 33 ", lastStartDate)
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var range = { $gte: from, $lte: to }
        var lastMonthRange = { $gte: lastStartDate, $lte: lastEndDate }
        var totalRevenuLast = 0;
        var totalExpenceCost = 0;
        var totalPartCostLast = 0;
        var totalLabourRevenueLast = 0;
        var totalPartCost = 0;
        var thisProfit = 0;


        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Getting Last Period Count details, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Invoice.find({ status: "Active", created_at: lastMonthRange, business: business })
            .cursor().eachAsync(async (invoice) => {
                var thisProfit = 0
                var serviceses = invoice.services.length
                for (var i = 0; i < serviceses; i++) {
                    for (var j = 0; j < invoice.services[i].parts.length; j++) {
                        var base = invoice.services[i].parts[j].base
                        var amount = invoice.services[i].parts[j].amount
                        var profit = amount - base
                        totalPartCost = totalPartCost + profit
                        // thisProfit = thisProfit + profit
                        // console.log("Base = ", base, "amount = " + amount + "Profit= " + profit, "   =Service id= " + invoice.services[i]._id)
                        // console.log(" totalPartCost 64751 ", totalPartCost)
                    }
                }

                // var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // if (duration <= 31) {
                //     month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');

                // }
                // analytics.push({
                //     thisProfit: thisProfit,
                //     sort: moment(invoice.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                //     month: month
                // });

            });
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Find Total Expenses Cost, Range:" + lastStartDate + " - " + lastEndDate);
        }
        await Purchase.find({ status: "Completed", created_at: lastMonthRange, business: business })
            .cursor().eachAsync(async (expence) => {

                totalExpenceCost = totalExpenceCost + expence.total;

            });
        // console.log("totalExpenceCost ", totalExpenceCost)
        await Invoice.find({ business: business, status: "Active", created_at: lastMonthRange })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                totalRevenuLast = totalRevenuLast + labour_cost + part_cost + of_cost

            });
        await OrderInvoice.find({ business: business, status: "Active", created_at: lastMonthRange })
            .cursor().eachAsync(async (invoice) => {

                totalRevenuLast = totalRevenuLast + invoice.payment.total

            });

        await Invoice.find({ created_at: lastMonthRange, status: "Active", business: business })
            .cursor().eachAsync(async (invoice) => {
                var partCost = invoice.payment.part_cost;

                totalPartCostLast = totalPartCostLast + invoice.payment.part_cost;
                totalLabourRevenueLast = totalLabourRevenueLast + invoice.payment.labour_cost;

            });

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Basic Counts in Response" + " " + "User:" + user.name);
        }
        var data = {

            allGraph: {
                totalExpenceCost: parseFloat(totalExpenceCost).toFixed(2),
                totalRevenueLast: parseFloat(totalRevenuLast).toFixed(2),
                totalPartCostLast: parseFloat(totalPartCost).toFixed(2),
                // thisProfit:parseFloat(thisProfit).toFixed(2) ,
                // thisProfit: parseInt(_.sumBy('thisProfit')),
                totalLabourRevenueLast: parseFloat(totalLabourRevenueLast).toFixed(2),
                totalGrossProfit: parseFloat(totalRevenuLast - totalExpenceCost).toFixed(2)
            },


        }


        res.status(200).json({
            responseCode: 200,
            responseMessage: "Basic Counts ",
            responseData: data
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Response Sends Successfully, Basic Counts.");
        }
    }
});

router.get('/categories/service/get', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /categories/service/get Api Called from business.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
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
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = []
        var totalService = [];
        var totalDetailing = [];
        var totalCustomization = [];
        var totalCollision = [];
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Getting Services details, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Invoice.find({ business: business, status: "Active", created_at: { $gte: from, $lte: to } })
            .cursor().eachAsync(async (invoice) => {
                var service = _.filter(invoice.services, type => type.type == "collision");
                analytics.push({
                    category: "Collision",
                    total: parseInt(_.sumBy(service, x => x.labour_cost)) + parseInt(_.sumBy(service, x => x.part_cost)) + parseInt(_.sumBy(service, x => x.of_cost)),
                    labour_cost: _.sumBy(service, x => x.labour_cost),
                    part_cost: _.sumBy(service, x => x.part_cost),
                    of_cost: _.sumBy(service, x => x.of_cost)
                })

                var service = _.filter(invoice.services, type => type.type == "services");
                analytics.push({
                    category: "Service",
                    total: parseInt(_.sumBy(service, x => x.labour_cost)) + parseInt(_.sumBy(service, x => x.part_cost)) + parseInt(_.sumBy(service, x => x.of_cost)),
                    labour_cost: _.sumBy(service, x => x.labour_cost),
                    part_cost: _.sumBy(service, x => x.part_cost),
                    of_cost: _.sumBy(service, x => x.of_cost)
                })


                var service = _.filter(invoice.services, type => type.type == "detailing");
                analytics.push({
                    category: "Detailing",
                    total: parseInt(_.sumBy(service, x => x.labour_cost)) + parseInt(_.sumBy(service, x => x.part_cost)) + parseInt(_.sumBy(service, x => x.of_cost)),
                    labour_cost: _.sumBy(service, x => x.labour_cost),
                    part_cost: _.sumBy(service, x => x.part_cost),
                    of_cost: _.sumBy(service, x => x.of_cost)
                })

                var service = _.filter(invoice.services, type => type.type == "customization");
                analytics.push({
                    category: "Customization",
                    total: parseInt(_.sumBy(service, x => x.labour_cost)) + parseInt(_.sumBy(service, x => x.part_cost)) + parseInt(_.sumBy(service, x => x.of_cost)),
                    labour_cost: _.sumBy(service, x => x.labour_cost),
                    part_cost: _.sumBy(service, x => x.part_cost),
                    of_cost: _.sumBy(service, x => x.of_cost)
                })
                for (var i = 0; i < invoice.services.length; i++) {
                    if (invoice.services[i].type == 'services') {
                        totalService.push(1)
                    } else if (invoice.services[i].type == 'detailing') {
                        totalDetailing.push(1)
                    } else if (invoice.services[i].type == 'customization') {
                        totalCustomization.push(1)
                    } else if (invoice.services[i].type == 'collision') {
                        totalCollision.push(1)
                    }
                }

            });

        var data = _(analytics).groupBy('category').map((objs, key) => ({
            category: key,
            total: parseInt(_.sumBy(objs, 'total')),
            labour_cost: parseInt(_.sumBy(objs, 'labour_cost')),
            part_cost: parseInt(_.sumBy(objs, 'part_cost')),
            other_cost: parseInt(_.sumBy(objs, 'of_cost')),
            totalCount: objs.length
        })
        ).value();

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Services Details in Response" + ", " + "User:" + user.name);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                totalService: totalService.length,
                totalDetailing: totalDetailing.length,
                totalCustomization: totalCustomization.length,
                totalCollision: totalCollision.length
            },
            responseData: data
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Response Sends Successfully," + " " + "Data:" + JSON.stringify(data) + ", " + "User:" + user.name);
        }
    }

});

function segmentSort(segment) {
    var s = 0;
    if (segment == "Small") {
        s = 1;
    } else if (segment == "Medium") {
        s = 2;
    } else if (segment == "Premium") {
        s = 3;
    } else if (segment == "Premium XL") {
        s = 4;
    } else if (segment == "Luxury") {
        s = 5;
    } else if (segment == "Luxury XL") {
        s = 6;
    } else if (segment == "Sports") {
        s = 7;
    }

    return s;
}
router.get('/categories/cardata/get', /* xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO: /categories/cardata/get Api Called from business.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);
    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Date are required in query.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Date are required",
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
        var date = new Date();
        var business = req.headers['business']
        var user = await User.findById(decoded.user).exec();
        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Validated successfully and find date from query.");
        }
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0
        var payment = 0
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Getting Categories wise car details, From Date:" + from + "-" + "To:" + to + ", " + "User:" + user.name);
        }
        await Invoice.find({ status: "Active", business: business, created_at: { $gte: from, $lte: to } })
            .populate({ path: 'car', select: '_id model', populate: { path: 'model' } })
            .cursor().eachAsync(async (booking) => {
                if (booking.car.model) {
                    payment = 0
                    // console.log("booking.car.model.segment= " + booking.car.model.segment)
                    var pick_up_charges = booking.payment.pick_up_charges;
                    var policy_clause = booking.payment.policy_clause;
                    var salvage = booking.payment.salvage;


                    var labour_cost = _.sumBy(booking.services, x => x.labour_cost);
                    var part_cost = _.sumBy(booking.services, x => x.part_cost);
                    var of_cost = _.sumBy(booking.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;

                    payment = labour_cost + part_cost + of_cost
                    analytics.push({ segment: booking.car.model.segment, cost: payment })
                    // analytics.push({ segment: booking.car.model.segment, cost: booking.payment.total })
                }
            });

        // return res.json(analytics)
        // analytics = _.orderBy(analytics, ['sort'], ['asc'])
        // var data = _(analytics).groupBy('month').map((objs, key) => ({
        //     revenu: parseInt(_.sumBy(objs, 'revenue')),
        //     month: key,
        //     total: objs.length,
        // })
        // ).value();
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Categories wise car Details in Response" + ", " + "User:" + user.name);
        }
        var data = _.chain(analytics)
            .groupBy("segment")
            .map((value, key) => ({
                segment: key, jobs: value.length, sort: segmentSort(key),
                cost: parseFloat(_.sumBy(value, 'cost')),
            }))
            .value()

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: _.orderBy(data, ['sort'], ['desc'])
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Response Sends Successfully," + " " + "User:" + user.name);
        }

    }

});

router.get('/on-boarding/status', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/on-boarding/status Api Called from business.js," + " " + "Request Headers:" + JSON.stringify(req.headers));
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];

    var addUser = false;
    var addservice = false;
    var addStock = false;
    var addLogoQr = false;
    var onBoarding = []
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG :Fatching Account Details," + " " + "Business Id:" + business);
    }
    var account = await User.findById(business).exec();
    if (account) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Account Exists.");
        }
        var management = await Management.find({ business: business, user: { $ne: business } }).exec();
        // console.log("Business = " + business)

        var cre = _.filter(management, data => data.role == "CRE");

        var serviceAdvisor = _.filter(management, data => data.role == "Service Advisor");
        var technician = _.filter(management, data => data.role == "Technician");
        // console.log("Cre  = " + cre.length)
        // console.log("serviceAdvisor  = " + serviceAdvisor.length)
        // console.log("technician  = " + technician.length)
        if (cre.length > 0 && serviceAdvisor.length > 0 && technician.length > 0) {
            addUser = true;
        }
        onBoarding.push({
            status: addUser,
            tag: "Add User",
            step: 1
        })
        var service = await Service.find({ publish: true, custom: false, business: business }).count().exec();
        var detailing = await Detailing.find({ publish: true, custom: false, business: business }).count().exec();
        var customization = await Customization.find({ publish: true, custom: false, business: business }).count().exec();
        var collision = await Collision.find({ publish: true, custom: false, business: business }).count().exec();
        var serviceCounts = service + detailing + customization + collision;
        // console.log("Service  = " + service)
        // console.log("detailing  = " + detailing)
        // console.log("customization  = " + customization)
        // console.log("collision  = " + collision)
        if (serviceCounts > 0) {
            addservice = true;
        }
        onBoarding.push({
            status: addservice,
            tag: "Add Service",
            step: 2
        })
        var stock = await BusinessProduct.find({ business: business }).count().exec();
        // console.log("stock  = " + stock)

        if (stock > 0) {
            addStock = true;
        }
        onBoarding.push({
            status: addStock,
            tag: "Add Stock",
            step: 3
        })
        var user = await User.findById(business).exec();
        if (user.business_info) {
            if (user.business_info.qr_code != '' && user.business_info.company_logo != '') {
                addLogoQr = true;
            }
        }
        onBoarding.push({
            status: addLogoQr,
            tag: "QR & Logo",
            step: 4
        })
        // console.log("response", responseData)
        // var data = [{
        //     addUser: addUser,
        //     addservice: addservice,
        //     addStock: addStock,
        //     addLogoQr: addLogoQr,
        // }]
        var completed = false;
        var allSteps = _.filter(onBoarding, data => data.status == false);
        if (allSteps.length == 0) {
            completed = true;
        }
        res.status(200).json({
            responseCode: 200,
            responseData: {
                data: onBoarding,
                status: completed
            },
            responseMessage: "On-Boarding" + allSteps.length + " remaining"
        })
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO :Response Send Successfully.");
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING :Business Not Found" + " " + "Business Id:" + business);
        }
        res.status(422).json({
            responseCode: 422,
            responseData: data,
            responseMessage: "Business Not Found"
        })
    }

});


module.exports = router