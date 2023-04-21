var mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router(),
    config = require('../../config'),
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
    businessFunctions = require('../erpWeb/businessFunctions'),
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

const xAccessToken = require('../../middlewares/xAccessTokenBusiness');
const fun = require('../function');
const event = require('../event');
const whatsAppEvent = require('../whatsapp/whatsappEvent')
var paytm_config = require('../../paytm/paytm_config').paytm_config;
var paytm_checksum = require('../../paytm/checksum');

var salt = bcrypt.genSaltSync(10);
const User = require('../../models/user');
const BusinessTiming = require('../../models/businessTiming');
const BusinessConvenience = require('../../models/businessConvenience');
const BookingTiming = require('../../models/bookingTiming');
// const Type = require('../../models/type');
// const BusinessType = require('../../models/businessType');
const Category = require('../../models/category');
const Automaker = require('../../models/automaker');
const Model = require('../../models/model');
const QuotationOrders = require('../../models/quotationOrders')
const OrderLogs = require('../../models/orderLogs')
const State = require('../../models/state');
const BookingCategory = require('../../models/bookingCategory');
const ProductImage = require('../../models/productImage');
const Country = require('../../models/country');
const BusinessOffer = require('../../models/businessOffer');
const BusinessUser = require('../../models/businessUser');
const ProductOffer = require('../../models/productOffer');
const Order = require('../../models/order');
const BusinessOrder = require('../../models/businessOrder');
const OrderLine = require('../../models/orderLine');
const OrderConvenience = require('../../models/orderConvenience');
const OrderInvoice = require('../../models/orderInvoice');
const BookmarkProduct = require('../../models/bookmarkProduct');
const BookmarkOffer = require('../../models/bookmarkOffer');
const Car = require('../../models/car');
const CarSell = require('../../models/carSell');
const Asset = require('../../models/asset');
const CarImage = require('../../models/carImage');
const CarDocument = require('../../models/carDocument');
const BookmarkCar = require('../../models/bookmarkCar');
const BodyStyle = require('../../models/bodyStyle');
const FuelType = require('../../models/fuelType');
const Transmission = require('../../models/transmission');
const Color = require('../../models/color');
const Owner = require('../../models/owner');
const ServiceGallery = require('../../models/serviceGallery'); //abhinav
const BusinessGallery = require('../../models/businessGallery');
const Variant = require('../../models/variant');
const ClaimBusiness = require('../../models/claimBusiness');
const Review = require('../../models/review');
const Battery = require('../../models/battery');
const BatteryBrand = require('../../models/batteryBrand');
const TyreSize = require('../../models/tyreSize');
const Booking = require('../../models/booking');
const Lead = require('../../models/lead');
const Service = require('../../models/service');
const Customization = require('../../models/customization');
const Collision = require('../../models/collision');
const Washing = require('../../models/washing');
const ProductCategory = require('../../models/productCategory');
const Product = require('../../models/product');
const ProductBrand = require('../../models/productBrand');
const ProductModel = require('../../models/productModel');
const BusinessProduct = require('../../models/businessProduct');
const LeadRemark = require('../../models/leadRemark');
const LeadGenRemark = require('../../models/leadGenRemark');
const LeadStatus = require('../../models/leadStatus');
const Package = require('../../models/package');
const UserPackage = require('../../models/userPackage');
const PackageUsed = require('../../models/packageUsed');
const Management = require('../../models/management');
const LeadManagement = require('../../models/leadManagement');
const Address = require('../../models/address');
const Gallery = require('../../models/gallery');
const Coupon = require('../../models/coupon');
const Detailing = require('../../models/detailing');
const CouponUsed = require('../../models/couponUsed');
const Purchase = require('../../models/purchase');
const PurchaseReturn = require('../../models/purchaseReturn');
const PurchaseOrder = require('../../models/purchaseOrder');
const Tax = require('../../models/tax');
const BusinessVendor = require('../../models/businessVendor');
const JobInspection = require('../../models/jobInspection');
const ClubMember = require('../../models/clubMember');
const InsuranceCompany = require('../../models/insuranceCompany');
const LabourRate = require('../../models/labourRate');
const Point = require('../../models/point');
const QualityCheck = require('../../models/qualityCheck');
const Invoice = require('../../models/invoice');
const Expense = require('../../models/expense');
const Estimate = require('../../models/estimate');
const StockLogs = require('../../models/stockLogs');
// Vinay Model added
const VendorOrders = require('../../models/vendorOrders');

const TransactionLog = require('../../models/transactionLog');
const RFQ = require('../../models/rfq');
const Quotation = require('../../models/quotation');
const BusinessPlan = require('../../models/businessPlan');
const Referral = require('../../models/referral');
const ManagementRole = require('../../models/managementRole');
const Location = require('../../models/location');
const BusinessSetting = require('../../models/businessSetting');
const ExpenseCategory = require('../../models/expenseCategory');
const ReviewPoint = require('../../models/reviewPoint');
const LeadGen = require('../../models/leadGen');
const SuitePlan = require('../../models/suitePlan');
const { updateMany } = require('../../models/user');
const { filter, rangeRight } = require('lodash');



var secret = config.secret;

// router.post('/signup/old', async function(req, res, next) {
//     var rules = {
//         contact_no: 'required',
//         username: 'required',
//     };

//     var validation = new Validator(req.body, rules);
//     req.body['whatsAppChannelId'] = '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2';
//     if (validation.fails()) {
//         res.status(422).json({
//             responseCode: 422,
//             responseMessage: "Mobile No. and Username is required",
//             responseData: {
//                 res: validation.errors.all()
//             }
//         })
//     } else {
//         if (req.body.email) {
//             var checkEmail = await User.find({ email: req.body.email }).count().exec();
//         } else {
//             var checkEmail = 0;
//         }

//         if (checkEmail) {
//             res.status(422).json({
//                 responseCode: 422,
//                 responseMessage: "Email already in use.",
//                 responseData: {},
//             });
//         } else {
//             var checkUsername = await User.find({ username: req.body.username }).collation({ locale: 'en', strength: 2 }).exec();
//             if (checkUsername.length == 0) {
//                 var regexp = /^[a-zA-Z0-9._]+$/;
//                 var check = req.body.username;
//                 if (check.search(regexp) == -1) {
//                     res.status(422).json({
//                         responseCode: 422,
//                         responseMessage: "Use Only Alphabet, Numbers and dot & underscore",
//                         responseData: {},
//                     });
//                 } else {
//                     var checkPhone = await User.find({ contact_no: req.body.contact_no }).count().exec();
//                     if (checkPhone == 0) {

//                         var otp = Math.floor(Math.random() * 90000) + 10000;

//                         req.body.socialite = {};
//                         req.body.optional_info = {};

//                         var country = await Country.findOne({ _id: req.body.country }).exec();
//                         req.body.address = {
//                             // country: country.countryName,
//                             timezone: req.headers['tz'],
//                             // location: req.body.location,
//                         };

//                         req.body.account_info = {
//                             type: "business",
//                             status: "Complete",
//                             phone_verified: false,
//                             verified_account: false,
//                             approved_by_admin: false,
//                         };

//                         // req.body.geometry = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
//                         req.body.uuid = uuidv1();
//                         req.body.device = [];
//                         req.body.otp = otp;

//                         req.body.business_info = {
//                             business_category: req.body.business_category,
//                             company: req.body.company
//                         };

//                         var firstPart = (Math.random() * 46656) | 0;
//                         var secondPart = (Math.random() * 46656) | 0;
//                         firstPart = ("000" + firstPart.toString(36)).slice(-3);
//                         secondPart = ("000" + secondPart.toString(36)).slice(-3);
//                         req.body.referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();


//                         User.create(req.body).then(async function(user) {
//                             var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//                             // console.log("test")
//                             for (var i = 0; i < 7; i++) {
//                                 var timing = new BusinessTiming({
//                                     business: user._id,
//                                     day: days[i],
//                                     open: '09:30 AM',
//                                     close: '06:30 PM',
//                                     is_closed: false,
//                                     created_at: new Date(),
//                                     updated_at: new Date(),
//                                 });
//                                 timing.save();
//                             }
//                             await whatsAppEvent.autroidBusinessReg(user.name, user.contact_no, user._id);


//                             // Type.find({}).then(function(BT){
//                             //     BT.forEach(function (u) {
//                             //         var businessType = new BusinessType({
//                             //             business: user._id,
//                             //             business_type: u._id,
//                             //             is_added: false,
//                             //         });
//                             //         businessType.save();
//                             //     });
//                             // });

//                             event.autroidSignUpMail(user)
//                     event.autroidSignUpSMS(user)
//                     event.autroidOnboardings(user)
//                     event.otpSms(user);
//                     whatsAppEvent.welOnBoard(user.name, user.contact_no, user._id);
//                             res.status(200).json({
//                                 responseCode: 200,
//                                 responseMessage: "success",
//                                 responseData: {
//                                     user: user
//                                 },
//                             });
//                         });
//                     } else {
//                         res.status(400).json({
//                             responseCode: 400,
//                             responseMessage: "Phone number already in use.",
//                             responseData: {},
//                         });
//                     }
//                 }
//             } else {
//                 res.status(422).json({
//                     responseCode: 422,
//                     responseMessage: "Username already in use.",
//                     responseData: {},
//                 });
//             }
//         }
//     }
// });


// router.post('/signup', async function (req, res, next) {
//     var rules = {
//         contact_no: 'required',

//     };

//     var validation = new Validator(req.body, rules);
//     //var business = req.headers['business'];
//     req.body['whatsAppChannelId'] = '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2';
//     // console.log("------" + req.body['whatsAppChannelId']);

//     if (validation.fails()) {
//         res.status(422).json({
//             responseCode: 422,
//             responseMessage: "Mobile Number is required",
//             responseData: {
//                 res: validation.errors.all()
//             }
//         })
//     }
//     else {
//         if (req.body.name) {
//             var busuness_name = await User.find({ name: req.body.name }).count().exec();
//         }
//         else {
//             var busuness_name = 0;
//         }

//         if (req.body.email) {
//             var checkEmail = await User.find({ email: req.body.email }).count().exec();
//         }
//         else {
//             var checkEmail = 0;
//         }

//         if (checkEmail) {
//             res.status(422).json({
//                 responseCode: 422,
//                 responseMessage: "Email already in use.",
//                 responseData: {},
//             });
//         } else if (busuness_name) {
//             res.status(422).json({
//                 responseCode: 422,
//                 responseMessage: "Business name already taken.",
//                 responseData: {},
//             });
//         }
//         else {
//             // var checkUsername = await User.find({ username: req.body.name }).collation({ locale: 'en', strength: 2 }).exec();
//             // if (checkUsername.length == 0) {
//             //     var regexp = /^[a-zA-Z0-9._]+$/;
//             //     var check = req.body.username;
//             //     if (check.search(regexp) == -1) {
//             //         res.status(422).json({
//             //             responseCode: 422,
//             //             responseMessage: "Use Only Alphabet, Numbers and dot & underscore",
//             //             responseData: {},
//             //         });
//             //     }
//             //     else {
//             var checkPhone = await User.find({ contact_no: req.body.contact_no }).count().exec();
//             if (checkPhone == 0) {
//                 var firstPart = (Math.random() * 46656) | 0;
//                 var secondPart = (Math.random() * 46656) | 0;
//                 firstPart = ("000" + firstPart.toString(36)).slice(-3);
//                 secondPart = ("000" + secondPart.toString(36)).slice(-3);
//                 req.body.referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();


//                 var otp = Math.floor(Math.random() * 90000) + 10000;

//                 req.body.username = shortid.generate();

//                 req.body.socialite = {};
//                 req.body.optional_info = {};

//                 var address = req.body.address;

//                 var country = await Country.findOne({ timezone: { $in: req.headers['tz'] } }).exec();
//                 var count = await User.find({ "account_info.type": "business", "visibility": true }).count();
//                 // req.body.business_id = count + 10000; //
//                 var rand = Math.ceil((Math.random() * 100000) + 1);

//                 req.body.name = _.startCase(_.toLower(req.body.name));

//                 var name = req.body.name;

//                 req.body.address = {
//                     // country: country.countryName,
//                     timezone: req.headers['tz'],
//                     location: req.body.location,
//                     address: address,
//                     state: req.body.state,
//                     city: req.body.city,
//                     zip: req.body.zip,
//                     area: req.body.area,
//                     landmark: req.body.landmark,
//                     country_code: req.body.country_code
//                 };
//                 req.body.bank_details = {
//                     ifsc: req.body.ifsc,
//                     account_no: req.body.account_no,
//                     account_holder: req.body.account_holder
//                 };
//                 req.body.account_info = {
//                     type: "business",
//                     status: "Complete",
//                     added_by: null,
//                     phone_verified: false,
//                     verified_account: false,
//                     approved_by_admin: false,
//                     is_password: true,

//                 };
//                 req.body.geometry = [0, 0];
//                 if (req.body.longitude && req.body.latitude) {
//                     req.body.geometry = [req.body.longitude, req.body.latitude];
//                 }
//                 req.body.device = [];
//                 req.body.otp = otp;
//                 // console.log("Categotry = " + req.body.category,)
//                 req.body.business_info = {
//                     company_name: req.body.name,
//                     // business_category:req.body.business_category,
//                     business_id: count + 10000, //
//                     category: req.body.category,
//                     brand: req.body.carBrand,
//                     company: req.body.company,
//                     account_no: req.body.account_no,
//                     gst_registration_type: req.body.gst_registration_type,
//                     gstin: req.body.gstin,
//                     is_claimed: true,
//                     tax_registration_no: req.body.tax_registration_no,
//                     pan_no: req.body.pan_no
//                 };
//                 req.body.optional_info = {
//                     reg_by: req.body.name,
//                 }
//                 var started_at = null;
//                 if (req.body.started_at) {
//                     started_at = new Date(req.body.started_at).toISOString()
//                 }

//                 var expired_at = null;
//                 if (req.body.expired_at) {
//                     expired_at = new Date(req.body.expired_at).toISOString()
//                 }

//                 req.body.uuid = uuidv1();
//                 // var newhash = bcrypt.hashSync(req.body.password);
//                 // req.body.password = newhash

//                 User.create(req.body).then(async function (user) {
//                     var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//                     // console.log("test")
//                     for (var i = 0; i < 7; i++) {
//                         var timing = new BusinessTiming({
//                             business: user._id,
//                             day: days[i],
//                             open: '09:30 AM',
//                             close: '06:30 PM',
//                             is_closed: false,
//                             created_at: new Date(),
//                             updated_at: new Date(),
//                         });
//                         timing.save();
//                     }
//                     await whatsAppEvent.autroidBusinessReg(user.name, user.contact_no, user._id);
//                     var passwordData = {
//                         password: bcrypt.hashSync(req.body.password)
//                     }

//                     User.findOneAndUpdate({ _id: user._id }, { $set: passwordData }, { new: true }, async function (err, doc) {
//                         if (err) {
//                             var json = ({
//                                 responseCode: 400,
//                                 responseMessage: "Please Try Again",
//                                 responseData: err
//                             });

//                             res.status(400).json(json)
//                         }
//                         else {
//                             var data = {
//                                 otp: otp,
//                                 account_info: {
//                                     phone_verified: false,
//                                     status: 'Active',
//                                     approved_by_admin: false,
//                                     verified_account: false,
//                                     // added_by: user.account_info.added_by,
//                                     type: "business",
//                                     is_page: user.account_info.is_page,
//                                 }
//                             };

//                             User.findOneAndUpdate({ _id: user._id }, { $set: data }, function (err, doc) {

//                             });
//                         }
//                     });
//                     if (req.body.planCategory != "others") {
//                         var freePlan = await SuitePlan.findOne({ plan: "Free", category: req.body.planCategory }).exec();

//                         if (freePlan) {
//                             var plans = await BusinessPlan.find({ business: user._id, suite: freePlan.id }).count().exec();
//                             if (plans == 0) {
//                                 // console.log("Inside Plan = " + freePlan.id)
//                                 await SuitePlan.find({ _id: freePlan.id })
//                                     .cursor().eachAsync(async (plan) => {
//                                         if (plan) {
//                                             var plan_no = Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 10)
//                                             // console.log("Plans detail" + plan, business._id)
//                                             var expired_at = new Date();
//                                             // var status = ""
//                                             // if (plan.price - req.body.paid > 0) {

//                                             //     status = "Pending"
//                                             // } else if (plan.price - req.body.paid == 0) {


//                                             var status = "Success"

//                                             // }
//                                             expired_at.setDate(expired_at.getDate() + plan.validity);
//                                             BusinessPlan.create({
//                                                 suite: plan._id,
//                                                 plan: plan.plan,
//                                                 name: plan.name,
//                                                 short_name: plan.short_name,
//                                                 price: plan.price,
//                                                 default: plan.default,
//                                                 main: plan.main,
//                                                 limits: plan.limits,
//                                                 category: plan.category,
//                                                 validity: plan.validity,
//                                                 expired_at: expired_at,
//                                                 "payment.paid_total": parseInt(plan.price),
//                                                 "payment.due": plan.price - parseInt(plan.price),
//                                                 "payment.mode": "Free",
//                                                 "payment.total": plan.price,
//                                                 "payment.price": plan.price,
//                                                 "payment.payment_status": status,
//                                                 "due.due": plan.price - parseInt(plan.price),
//                                                 "due.pay": parseInt(plan.price),
//                                                 plan_no: plan_no,
//                                                 sold_by: user.name,
//                                                 created_at: new Date(),
//                                                 updated_at: new Date(),
//                                                 business: user._id,

//                                             })


//                                             // .cursor().eachAsync(async (business) => {
//                                             TransactionLog.create({
//                                                 user: user._id,
//                                                 activity: "Business-Plan",
//                                                 status: "Purchase",
//                                                 received_by: "Self Registered",
//                                                 // source: plan._id,
//                                                 // source: plan[0]._id,
//                                                 source: user._id,
//                                                 plan_no: plan_no,
//                                                 // source: order_id,
//                                                 business: user._id,
//                                                 // paid_by: req.body.paid_by,
//                                                 paid_by: "Customer",
//                                                 // paid_total: req.body.paid,
//                                                 // paid_total: parseInt(req.body.paid),
//                                                 paid_total: plan.price,
//                                                 total: plan.price,
//                                                 // payment_mode: req.body.payment_mode,
//                                                 payment_mode: "Free Account",
//                                                 payment_status: "Success",
//                                                 order_id: null,
//                                                 // transaction_id: req.body.transaction_id,
//                                                 transaction_id: "free Account",
//                                                 transaction_date: new Date(),
//                                                 transaction_status: "Success",
//                                                 transaction_response: "Success",
//                                                 created_at: new Date(),
//                                                 updated_at: new Date(),
//                                             })
//                                         }
//                                     });

//                                 // res.status(200).json({
//                                 //     responseCode: 200,
//                                 //     responseMessage: "Suite plans has been added.",
//                                 //     responseData: {}
//                                 // });
//                                 // console.log("Suite plans has been added.")
//                             }
//                             else {
//                                 // res.status(400).json({
//                                 //     responseCode: 400,
//                                 //     responseMessage: "Some Plans already active.",
//                                 //     responseData: {}
//                                 // });
//                                 // console.log("Some Plans already active.")
//                             }
//                         }
//                     }
//                     Management.create({
//                         business: user._id,
//                         user: user._id,
//                         role: "Admin",
//                         created_at: new Date(),
//                         updated_at: new Date(),
//                     });

//                     Address.create({
//                         user: user._id,
//                         address: address,
//                         area: req.body.area,
//                         landmark: req.body.landmark,
//                         zip: req.body.zip,
//                         city: req.body.city,
//                         state: req.body.state,
//                         created_at: new Date(),
//                         updated_at: new Date()
//                     });

//                     event.autroidSignUpMail(user)
//                     event.autroidSignUpSMS(user)
//                     event.autroidOnboardings(user)
//                     event.otpSms(user);
//                     //sumit...
//                     whatsAppEvent.welOnBoard(user.name, user.contact_no, user._id);





//                     // Type.find({}).then(function(BT){
//                     //     BT.forEach(function (u) {
//                     //         var businessType = new BusinessType({
//                     //             business: user._id,
//                     //             business_type: u._id,
//                     //             is_added: false,
//                     //         });
//                     //         businessType.save();
//                     //     });
//                     // });

//                     //event.signupSMS(user);
//                     //event.otpSms(user);

//                     res.status(200).json({
//                         responseCode: 200,
//                         responseMessage: "Business registered successfully",
//                         responseData: {
//                             user: user
//                         },
//                     });
//                 });
//             }
//             else {
//                 res.status(400).json({
//                     responseCode: 400,
//                     responseMessage: "Phone number already in use.",
//                     responseData: {},
//                 });
//             }
//         }
//         // }
//         // else {
//         //     res.status(422).json({
//         //         responseCode: 422,
//         //         responseMessage: "Username already in use.",
//         //         responseData: {},
//         //     });
//         // }
//         // }
//     }
// });

router.get('/chat/leads/add', async function (req, res, next) {
    var business = req.headers['business'];
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
            }, { new: false }, async function (err, doc) { });
        } else {
            var data = {}
            var manager = business;

            var status = await LeadStatus.findOne({ status: "Open" }).exec();

            var managers = [];
            await Management.find({ business: business, role: "CRE" })
                .cursor().eachAsync(async (a) => {
                    // var d = await Lead.find({ business: business, assignee: a.user }).count().exec();
                    var open = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                    var follow_up = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                    var d = open + follow_up;
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

                Lead.findOneAndUpdate({ _id: l._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) { })
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
                    Lead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) { })
                });
                fun.webNotification("Lead", lead);

                await whatsAppEvent.leadGenerate(lead._id, business);
                event.leadCre(lead._id, business);
                await whatsAppEvent.leadCre(lead._id, business);
                event.assistance(lead, req.headers['tz'])

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {}
                })
            });
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


router.get('/lead/tabs/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var loggedInDetails = await User.findById(decoded.user).exec();
    var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
    var suite = _.map(plans, 'suite');
    var def = [];
    for (var i = 0; i < plans.length; i++) {
        var serverTime = moment.tz(new Date(), req.headers['tz']);
        var bar = plans[i].created_at;
        bar.setDate(bar.getDate() + plans[i].validity);
        var e = bar;
        bar = moment.tz(bar, req.headers['tz'])

        var baz = bar.diff(serverTime);
        if (baz > 0) {
            var defaults = suite[i].default;
            for (var j = 0; j < defaults.length; j++) {
                if (defaults[j].action == "Leads") {
                    var newArr = defaults[j].activityTab;
                    def = _.concat(def, newArr);
                }
            }
        }
    }

    var def = _.uniqBy(def, function (o) {
        return o.activity;
    });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "navigation",
        responseData: def
    });
});


router.put('/lead/contacted/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var rules = {
        lead: 'required',
        contacted: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Label required",
            responseData: {
                res: validation.errors.all()
            }
        });
    } else {
        var check = await Lead.findOne({ business: business, _id: req.body.lead }).exec();
        if (check) {
            var data = {
                updated_at: new Date(),
                contacted: JSON.parse(req.body.contacted)
            };

            Lead.findOneAndUpdate({ _id: req.body.lead }, { $set: data }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                } else {
                    if (req.body.contacted == true) {
                        var tag = "Contacted";
                    } else {
                        var tag = "Not Contacted";
                    }


                    LeadRemark.create({
                        lead: check._id,
                        reason: check.remark.reason,
                        status: check.remark.status,
                        color_code: check.remark.color_code,
                        assignee: user,
                        customer_remark: tag,
                        assignee_remark: tag,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }).then(function (newRemark) {
                        Lead.findOneAndUpdate({ _id: check._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) { })
                    });

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Lead Updated",
                        responseData: {}
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead not found",
                responseData: {}
            })
        }
    }
});


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
                type: lead.type,
                source: lead.source,
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


router.get('/lead/user/cars/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];


    var lead = await Lead.findOne({ business: business, _id: req.query.lead }).exec();

    if (lead) {
        if (lead.contact_no) {
            var leadUser = {
                name: lead.name,
                contact_no: lead.contact_no,
                email: lead.email,
                user: lead.user,
            }
            var user = await q.all(getUser(leadUser))
            if (user) {
                Lead.findOneAndUpdate({ _id: lead._id }, { $set: { user: user } }, { new: false }, async function (err, doc) {
                    var car = []

                    await Car.find({ user: user, status: true })
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

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "User added",
                        responseData: car
                    });
                });
            } else {
                res.status(422).json({
                    responseCode: 400,
                    responseMessage: "User information incomplete",
                    responseData: {}
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Contact No required",
                responseData: {}
            });
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Lead not found",
            responseData: {}
        });
    }
});


router.post('/job/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        registration_no: 'required',
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
    } else {
        var token = req.headers['x-access-token'];
        var business = req.headers['business'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var loggedInDetails = await User.findById(decoded.user).exec();
        var customer_requirements = [];
        var advisor = await q.all(getAdvisor(loggedInDetails._id, business));

        var check = await User.findOne({ _id: req.body.user }).exec();
        if (check) {
            var date = null;
            if (req.body.date) {
                date = new Date(req.body.date).toISOString();
            }

            if (req.body.requirement) {
                customer_requirements.push({
                    user: loggedInDetails._id,
                    added_by: loggedInDetails.name,
                    requirement: req.body.requirement,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }

            var insurance_info = {
                "driver": null,
                "accident_place": "",
                "accident_date": null,
                "accident_time": "",
                "accident_cause": "",
                "fir": "",
                "branch": "",
                "cashless": "true",
                "claim": "false",
                "contact_no": "",
                "claim_no": "",
                "driver_accident": "",
                "expire": null,
                "gstin": "",
                "insurance_company": "",
                "manufacture_year": "",
                "policy_holder": "",
                "policy_no": "",
                "policy_type": "",
                "premium": 0,
                "spot_survey": "",
                "state": ""
            }

            var rg = req.body.registration_no;
            req.body.registration_no = rg.replace(/ /g, '');

            var getCar = await Car.findOne({ registration_no: req.body.registration_no, status: true }).exec();
            if (getCar) {
                /*if(!getCar.user.equals(check._id))
                {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Registration no authentication error",
                        responseData: {}
                    })
                }
                else
                {*/
                var booking = await Booking.findOne({ car: getCar._id, status: { $nin: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] }, is_services: true }).exec();

                if (booking) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Booking already exists for the same registration no. [" + booking.status + "]",
                        responseData: {},
                    });
                } else {
                    var pick_up_charges = 0;
                    var bookingService = [];

                    var countBooking = await Booking.find({}).count().exec();

                    if (req.body.charges) {
                        pick_up_charges = parseFloat(req.body.charges);
                    }

                    var due = {
                        due: pick_up_charges
                    };

                    var payment = {
                        payment_mode: "",
                        payment_status: "Pending",
                        discount_type: "",
                        coupon: "",
                        coupon_type: "",
                        discount: 0,
                        discount_total: 0,
                        part_cost: 0,
                        labour_cost: 0,
                        paid_total: 0,
                        pick_up_charges: pick_up_charges,
                        total: pick_up_charges,
                        discount_applied: false,
                        transaction_id: "",
                        transaction_date: "",
                        transaction_status: "",
                        transaction_response: ""
                    }

                    var bookingData = {
                        package: null,
                        car: getCar._id,
                        advisor: advisor,
                        manager: null,
                        business: business,
                        user: check.id,
                        services: bookingService,
                        customer_requirements: customer_requirements,
                        booking_no: Math.round(+new Date() / 1000),
                        date: date,
                        time_slot: req.body.time_slot,
                        convenience: "",
                        status: "EstimateRequested",
                        payment: payment,
                        due: due,
                        address: req.body.address,
                        lead: null,
                        insurance_info: insurance_info,
                        is_services: true,
                        created_at: new Date(),
                        updated_at: new Date()
                    };


                    Booking.create(bookingData).then(async function (b) {
                        var bookings = [];
                        var booking = await Booking.findById(b._id)
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email business_info" } })
                            .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
                            .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
                            .exec();


                        if (booking.address) {
                            var address = await Address.findOne({ _id: booking.address }).exec();
                        } else {
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

                        var manager = null;
                        if (booking.manager) {
                            manager = {
                                name: booking.manager.name,
                                _id: booking.manager._id,
                                id: booking.manager.id,
                                contact_no: booking.manager.contact_no,
                                email: booking.manager.email
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
                                contact_no: booking.user.contact_no,
                                email: booking.user.email,
                                business_info: booking.user.business_info
                            },
                            manager: manager,
                            services: booking.services,
                            convenience: booking.convenience,
                            date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                            time_slot: booking.time_slot,
                            status: booking.status,
                            booking_no: booking.booking_no,
                            job_no: booking.job_no,
                            estimation_requested: booking.estimation_requested,
                            address: address,
                            remarks: booking.remarks,
                            customer_requirements: booking.customer_requirements,
                            payment: booking.payment,
                            txnid: booking.txnid,
                            __v: booking.__v,
                            created_at: moment(booking.created_at).tz(req.headers['tz']).format('lll'),
                            updated_at: moment(booking.updated_at).tz(req.headers['tz']).format('lll'),
                        });

                        event.zohoLead(b._id);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Booking",
                            responseData: bookings
                        });
                    });
                }
                /*}*/
            } else {
                var variant = await Variant.findOne({ _id: req.body.variant }).select('-service_schedule').exec();
                if (variant) {
                    var rg = req.body.registration_no;
                    req.body.registration_no = rg.replace(/ /g, '');

                    var reg = await Car.find({ registration_no: req.body.registration_no, status: true }).count().exec();
                    if (reg == 0) {
                        var data = {
                            geometry: [
                                0,
                                0
                            ],
                            registration_no: rg.replace(/ /g, ''),
                            reg_no_copy: rg.replace(/ /g, ''),
                            created_at: new Date(),
                            updated_at: new Date(),
                            title: variant.variant,
                            variant: variant._id,
                            _variant: variant.value,
                            automaker: variant.automaker,
                            _automaker: variant._automaker,
                            model: variant.model,
                            _model: variant._model,
                            segment: variant.segment,
                            user: check._id,
                            vin: req.body.vin,
                            engine_no: req.body.engine_no,
                            fuel_type: variant.specification.fuel_type,
                            transmission: variant.specification.type,
                            carId: Math.round(new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                        };

                        Car.create(data).then(async function (car) {
                            var bookingService = [];
                            var customer_requirements = [];
                            var countBooking = await Booking.find({}).count().exec();

                            var payment = {
                                payment_mode: "",
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
                                car: car,
                                advisor: advisor,
                                business: business,
                                user: check.id,
                                services: bookingService,
                                customer_requirements: customer_requirements,
                                booking_no: Math.round(+new Date() / 1000),
                                date: new Date(),
                                time_slot: "",
                                convenience: "",
                                status: "EstimateRequested",
                                payment: payment,
                                address: null,
                                lead: null,
                                insurance_info: insurance_info,
                                is_services: true,
                                created_at: new Date(),
                                updated_at: new Date()
                            };


                            Booking.create(bookingData).then(async function (b) {
                                var bookings = [];
                                var booking = await Booking.findById(b._id)
                                    .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email business_info" } })
                                    .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
                                    .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
                                    .exec();


                                if (booking.address) {
                                    var address = await Address.findOne({ _id: booking.address }).exec();
                                } else {
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
                                } else {
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
                                var manager = null;
                                if (booking.manager) {
                                    manager = {
                                        name: booking.manager.name,
                                        _id: booking.manager._id,
                                        id: booking.manager.id,
                                        contact_no: booking.manager.contact_no,
                                        email: booking.manager.email
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
                                        contact_no: booking.user.contact_no,
                                        email: booking.user.email,
                                        business_info: booking.user.business_info
                                    },
                                    manager: manager,
                                    services: booking.services,
                                    convenience: booking.convenience,
                                    date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                                    time_slot: booking.time_slot,
                                    status: booking.status,
                                    booking_no: booking.booking_no,
                                    job_no: booking.job_no,
                                    estimation_requested: booking.estimation_requested,
                                    address: address,
                                    remarks: booking.remarks,
                                    customer_requirements: booking.customer_requirements,
                                    payment: booking.payment,
                                    txnid: booking.txnid,
                                    __v: booking.__v,
                                    created_at: moment(booking.created_at).tz(req.headers['tz']).format('lll'),
                                    updated_at: moment(booking.updated_at).tz(req.headers['tz']).format('lll'),
                                });


                                event.zohoLead(b._id)

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "Booking",
                                    responseData: bookings
                                });
                            });
                        });
                    } else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "registration no already exist",
                            responseData: {}
                        });
                    }
                } else {
                    return res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Car variant not found",
                        responseData: {}
                    })
                }
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User not found",
                responseData: {}
            });
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
    } else {
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
                } else {
                    var activity = {
                        user: booking.business,
                        model: "Booking",
                        activity: "bookingReschedule",
                        source: booking._id,
                        modified: "",
                        created_at: data.updated_at,
                        updated_at: data.updated_at
                    }
                    fun.bookingLog(activity);

                    //event.assignedBookingMail(booking._id);
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
        } else {
            var json = ({
                responseCode: 400,
                responseMessage: "Not eligible for rework",
                responseData: {}
            });
            res.status(400).json(json)
        }
    }
});


router.get('/booking/activities/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Booking required",
            responseData: {
                res: validation.errors.all()
            }
        })
    } else {
        var booking = await Booking.findOne({ _id: req.query.id }).exec();
        var activities = [];

        if (booking) {
            await bookingLog.find({ source: booking._id })
                .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                .cursor().eachAsync(async (activity) => {
                    activities.push({
                        user: {
                            name: activity.user.name,
                            _id: activity.user._id,
                            id: activity.user.id,
                            contact_no: activity.user.contact_no
                        },
                        activity: _.startCase(activity.activity),
                        modified: activity.modified,
                        created_at: activity.created_at,
                        updated_at: activity.updated_at,
                    });
                });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: activities,
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking required",
                responseData: {}
            })
        }
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
                } else {
                    var booking = await Booking.findOne({ _id: req.body.booking }).exec();
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Car has been added",
                        responseData: booking
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Car not found",
                responseData: {}
            });
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking not found",
            responseData: {}
        });
    }
});

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

        $or: [{
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

router.put('/booking/reschedule/', xAccessToken.token, async function (req, res, next) {
    var rules = {
        id: 'required',
        date: 'required',
        time_slot: 'required'
    };
    // console.log("Data booking/reschedule   ");
    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Error",
            responseData: {
                res: validation.errors.all()
            }
        });
    } else {
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
        var loggedInDetails = await User.findById(decoded.user).exec();
        var role = await Management.findOne({ user: loggedInDetails._id, business: business }).exec();

        var booking = await Booking.findOne({ _id: req.body.id, business: business, is_services: true }).exec();



        if (!booking) {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {},
            });
        } else {
            var check = await BookingTiming.find({ business: business }).count().exec();

            var body = booking.services;
            body = _.uniqBy(body, 'type');
            var slots = [];
            var date = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
            var next = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
            next.setDate(date.getDate() + 1);


            for (var i = 0; i < body.length; i++) {
                if (body[i].type == "addOn") {
                    body[i].type = "services"
                }
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
                                slots.push({
                                    slot: timing.slot,
                                    count: slot,
                                    sort: timing.sort,
                                    type: timing.category,
                                    status: true
                                });
                            }
                        });
                } else {
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
                                slots.push({
                                    slot: timing.slot,
                                    count: slot,
                                    sort: timing.sort,
                                    type: timing.category,
                                    status: true
                                });
                            }
                        });
                }
            }

            if (slots.length <= 0) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "All Slots are full for " + req.body.date,
                    responseData: {}
                });
            } else {
                var status = "Confirmed";
                var data = {
                    date: new Date(req.body.date).toISOString(),
                    time_slot: req.body.time_slot,
                    status: "Confirmed",
                    updated_at: new Date()
                };

                Booking.findOneAndUpdate({ _id: req.body.id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        var json = ({
                            responseCode: 400,
                            responseMessage: "Error occured",
                            responseData: {}
                        });
                        res.status(400).json(json)
                    } else {
                        var booking = await Booking.findById(req.body.id).exec()

                        var activity = {
                            user: loggedInDetails._id,
                            name: loggedInDetails.name,
                            stage: "Booking",
                            activity: "rescheduleBooking",
                        };

                        fun.bookingLog(booking._id, activity);
                        if (role.role == "CRE") {
                            var notify = {
                                receiver: [booking.advisor],
                                activity: "booking",
                                tag: "bookingReschedule",
                                source: booking._id,
                                sender: loggedInDetails._id,
                                points: 0,
                                tz: req.headers['tz']
                            };
                            fun.newNotification(notify);
                        }

                        if (role.role == "Service Advisor") {
                            var notify = {
                                receiver: [booking.manager],
                                activity: "booking",
                                tag: "bookingReschedule",
                                source: booking._id,
                                sender: loggedInDetails._id,
                                points: 0,
                                tz: req.headers['tz']
                            };
                            fun.newNotification(notify);
                        }


                        var notify = {
                            receiver: [booking.user],
                            activity: "booking",
                            tag: "bookingReschedule",
                            source: booking._id,
                            sender: loggedInDetails._id,
                            points: 0,
                            tz: req.headers['tz']
                        };
                        fun.newNotification(notify);
                        event.rescheduleMail(booking._id, loggedInDetails.account_info.type);

                        var json = ({
                            responseCode: 200,
                            responseMessage: "Booking rescheduled",
                            responseData: {
                                status: booking.status,
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
    }
});

router.get('/product/category/get', xAccessToken.token, async function (req, res, next) {
    const productCategories = await ProductCategory.find({ parent_id: null }).exec();
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: productCategories
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
    } else if (req.query.by == "tag") {
        var data = await ProductBrand.find({ tag: req.query.query }).exec();
    } else if (req.query.by == "id") {
        var data = await ProductBrand.findOne({ _id: req.query.query }).exec();
    } else {
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
    } else {
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
    } else {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: await Product.find({ product_model: req.query.id, /*common: true*/ }).exec(),
        });
    }
});

router.delete('/vendor/delete', xAccessToken.token, async function (req, res, next) {
    var rules = {
        vendor: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Business is required!",
            responseData: {
                res: validation.errors.all()
            }
        })
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];

        var user = await User.findById(req.body.vendor).exec();

        if (user) {
            BusinessVendor.remove({ vendor: user._id, business: business }).exec();
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Vendor has been removed from list",
                responseData: {},
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Business not found",
                responseData: {},
            });
        }
    }
});



router.post('/products/type/update', xAccessToken.token, async function (req, res, next) {
    await Product.find({}).cursor().eachAsync(async (product) => {
        BusinessProduct.findOneAndUpdate({ product: product._id }, { $set: { type: product.type } }, { new: false }, function (err, doc) { });
    })

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Product has been update",
        responseData: {}
    });
});

router.delete('/product/sku/delete', xAccessToken.token, async function (req, res, next) {
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var business = req.headers['business'];
        var product = await BusinessProduct.findOne({ _id: req.body.product, business: business }).exec();
        if (product) {
            var totalSKU = product.sku
            if (totalSKU.length > 1) {
                BusinessProduct.findOneAndUpdate({
                    _id: req.body.product,
                    business: business,
                    sku: {
                        $elemMatch: {
                            '_id': req.body.id
                        }
                    }
                }, {
                    "$pull": {
                        "sku": { "_id": req.body.id }
                    }
                },
                    function (err, doc) {
                        if (err) {
                            res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Server Error",
                                responseData: err,
                            });
                        } else {
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "SKU updated",
                                responseData: {},
                            });
                        }
                    });
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "You cannot delete this SKU location. Permission to edit only",
                    responseData: {}
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

router.get('/vertical/products/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
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


    await Product.find({ $or: [{ part_no: new RegExp(req.query.query, "i") }, { title: new RegExp(req.query.query, "i") }] })
        .cursor().eachAsync(async (p) => {
            result.push({
                _id: p._id,
                id: p._id,
                product: p.product,
                part_no: p.part_no,
                hsn_sac: p.hsn_sac,
                specification: p.specification,
                long_description: p.long_description,
                unit: p.unit,
            })
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result
    })
});

router.put('/expense/date/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        expense: 'required',
        date: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Due Date required",
            responseData: {
                res: validation.errors.all()
            }
        });
    } else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var date = new Date();
        var loggedInDetails = decoded.user;
        var items = [];
        var data = [];

        var item_total = 0;
        var discount = 0;
        var item_total = 0;
        var total = 0;

        var expense = await Expense.findById(req.body.expense).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (expense) {
            var date = new Date(req.body.date).toISOString();

            Expense.findOneAndUpdate({ _id: expense._id }, { $set: { date: date, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                } else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Saved",
                        responseData: {
                            due_date: moment(date).tz(req.headers['tz']).format("YYYY-MM-DD")
                        }
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Expense not found",
                responseData: {}
            });
        }
    }
});

router.put('/expense/category/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        expense: 'required',
        category: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Due Date required",
            responseData: {
                res: validation.errors.all()
            }
        });
    } else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var date = new Date();
        var loggedInDetails = decoded.user;
        var items = [];
        var data = [];

        var item_total = 0;
        var discount = 0;
        var item_total = 0;
        var total = 0;

        var expense = await Expense.findById(req.body.expense).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (expense) {
            Expense.findOneAndUpdate({ _id: expense._id }, { $set: { category: req.body.category, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                } else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Saved",
                        responseData: {
                            category: req.body.category
                        }
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Expense not found",
                responseData: {}
            });
        }
    }
});

router.put('/expense/payee/update', xAccessToken.token, async function (req, res, next) {
    var rules = {
        expense: 'required',
        payee_name: 'required',
        payee_contact_no: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Payee Info required",
            responseData: {
                res: validation.errors.all()
            }
        });
    } else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var date = new Date();
        var loggedInDetails = decoded.user;
        var items = [];
        var data = [];

        var item_total = 0;
        var discount = 0;
        var item_total = 0;
        var total = 0;

        var expense = await Expense.findById(req.body.expense).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (expense) {
            var payee = await User.findById(req.body.payee).exec();
            if (payee) {
                Expense.findOneAndUpdate({ _id: expense._id }, { $set: { payee: null, payee_name: req.body.payee_name, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    } else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Saved",
                            responseData: {}
                        });
                    }
                });
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "User not found",
                    responseData: {}
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Expense not found",
                responseData: {}
            });
        }
    }
});
// vinay bill get

router.get('/get/bill', async function (req, res, next) {
    let reference_no = req.query.reference_no
    let logs = await StockLogs.findOne({ reference_no: reference_no }).exec()
    res.json({
        logs: logs,
        logsArr: logs.logs
    })
})

router.put('/purchase-return', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;

    var purchase = await PurchaseReturn.findOne({ _id: req.body.purchase, status: "Active" }).exec();
    var newDate = new Date();
    if (purchase) {
        var items = [];
        var products = purchase.items;

        if (products.length > 0) {
            for (var p = 0; p < products.length; p++) {
                if (products[p].status == true) {
                    if (products[p].lot != null && products[p].quantity != null) {
                        var quantity = products[p].quantity * products[p].lot;
                        var businessProduct = await BusinessProduct.findById(products[p].product).exec();
                        if (businessProduct) {
                            var stockTotal = parseFloat(businessProduct.stock.total) - quantity;
                            var stockAvailable = parseFloat(businessProduct.stock.available) - quantity;
                            var stockConsumed = parseFloat(businessProduct.stock.consumed);

                            if (stockAvailable < 0) {
                                stockAvailable = 0;
                            }

                            var stock = {
                                total: stockTotal,
                                available: stockAvailable,
                                consumed: stockConsumed
                            }

                            BusinessProduct.findOneAndUpdate({ _id: businessProduct._id }, { $set: { stock: stock } }, { new: false }, async function () { });
                        }
                    }
                }
            }

            var bill = {
                updated_at: new Date(),
                status: "Closed"
            };

            PurchaseReturn.findOneAndUpdate({ _id: purchase._id }, { $set: bill }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error...",
                        responseData: {}
                    });
                } else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Successfully Saved",
                        responseData: await PurchaseReturn.findById(purchase._id).exec()
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Items not found",
                responseData: {}
            });
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Purchase not found",
            responseData: {}
        });
    }
});

router.delete('/purchase-return/delete', xAccessToken.token, async function (req, res, next) {
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];
        var product = new Object();
        var result = [];
        var tax = [];
        var total = 0;
        var purchase = await PurchaseReturn.findOne({ _id: req.query.query, status: "Incomplete" }).exec();
        if (purchase) {
            await PurchaseReturn.findByIdAndRemove(purchase._id).exec();
            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been deleted",
                responseData: {},
            })
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Purchase not found",
                responseData: {}
            });
        }
    }
})

router.post('/rfq/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var id = null;
    var result = [];
    var total = 0;

    var newDate = new Date();

    var items = [];
    var products = req.body.items;
    for (var i = 0; i < products.length; i++) {
        if (products[i].product) {
            var product = await BusinessProduct.findOne({ product: products[i].product }).exec();
            items.push({
                product: product.product,
                part_no: products[i].part_no,
                hsn_sac: products[i].hsn_sac,
                title: products[i].title,
                description: products[i].description,
                quantity: parseFloat(products[i].quantity),
            });
        } else {
            items.push({
                product: null,
                part_no: products[i].part_no,
                hsn_sac: products[i].hsn_sac,
                title: products[i].title,
                description: products[i].description,
                quantity: parseFloat(products[i].quantity),
            });
        }
    }

    var data = {
        date: new Date(req.body.date).toISOString(),
        note: req.body.note,
        vin: req.body.vin,
        memo: req.body.memo,
        emails: req.body.emails,
        items: items,
        vendors: req.body.vendors,
        address: req.body.address,
        business: business,
        status: "Open",
        log: {
            status: "Open",
            remark: "",
            created_at: newDate,
            updated_at: newDate,
        },
        created_at: newDate,
        updated_at: newDate,
    };

    RFQ.create(data).then(async function (quotation) {
        var count = await RFQ.find({ _id: { $lt: quotation._id }, business: business }).count();
        var rfq_no = count + 10000;

        RFQ.findOneAndUpdate({ _id: quotation._id }, { $set: { rfq_no: rfq_no } }, { new: true }, async function (err, doc) {
            if (err) {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Server error",
                    responseData: err
                });
            } else {
                var vendors = quotation.vendors;
                for (var i = 0; i < vendors.length; i++) {
                    var data = {
                        rfq: quotation._id,
                        date: new Date(req.body.date).toISOString(),
                        note: quotation.note,
                        vin: quotation.vin,
                        memo: quotation.memo,
                        items: quotation.items,
                        address: quotation.address,
                        vendor: vendors[i],
                        business: business,
                        status: "Open",
                        total: 0,
                        log: {
                            status: "Open",
                            remark: "",
                            created_at: newDate,
                            updated_at: newDate,
                        },
                        created_at: newDate,
                        updated_at: newDate,
                    };

                    Quotation.create(data).then(async function (q) {
                        var count = await Quotation.find({ _id: { $lt: q._id }, business: business }).count();
                        var quotation_no = count + 10000;

                        Quotation.findOneAndUpdate({ _id: q._id }, { $set: { quotation_no: quotation_no } }, { new: true }, async function (err, doc) {
                            if (err) {
                                // console.log(err)
                            } else {
                                // console.log("err")
                            }
                        })
                    });
                }


            }
        });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Quotation has been placed",
            responseData: await RFQ.findById(quotation._id).exec()
        });
    });
});

router.get('/rfq/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;


    var quotations = [];
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.limit == undefined) {
        var vendors = 25;
    } else {
        var limit = parseInt(req.query.limit);
    }

    await RFQ.find({ business: business })
        .sort({ created_at: -1 }).skip(limit * page).limit(limit)
        .cursor()
        .eachAsync(async (r) => {
            var vendors = r.vendors;
            quotations.push({
                _id: r._id,
                id: r._id,
                rfq_no: r.rfq_no,
                date: moment(r.date).tz(req.headers['tz']).format("YYYY-MM-DD"),
                vendors: vendors.length,
                status: r.status,
                log: r.log,
                created_at: moment(r.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(r.updated_at).tz(req.headers['tz']).format('lll'),
            })
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: quotations
    });
});

router.get('/quotations/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;


    var quotations = [];
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));

    if (req.query.limit == undefined) {
        var vendors = 25;
    } else {
        var limit = parseInt(req.query.limit);
    }

    if (req.query.by == "rfq") {
        var query = { rfq: req.query.query }
    } else if (req.query.by == "vendors") {
        var query = { vendors: { $in: req.query.query } }
    } else {
        var query = { business: req.query.query }
    }


    await Quotation.find(query)
        .populate({ path: 'business', select: '_id id name contact_no avatar avatar_address email' })
        .populate({ path: 'vendor', select: '_id id name contact_no avatar avatar_address email' })
        .sort({ total: -1 }).skip(limit * page).limit(limit)
        .cursor()
        .eachAsync(async (r) => {
            var vendors = r.vendors;
            quotations.push({
                _id: r._id,
                id: r._id,
                rfq_no: r.rfq_no,
                quotation_no: r.quotation_no,
                date: moment(r.date).tz(req.headers['tz']).format("YYYY-MM-DD"),
                business: r.business,
                vendor: r.vendor,
                status: r.status,
                total: r.total,
                log: r.log,

                created_at: moment(r.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(r.updated_at).tz(req.headers['tz']).format('lll'),
            })
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseData: quotations
    });
});

router.get('/quotation/details/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;

    var r = await Quotation.findOne({ _id: req.query.quotation })
        .populate({ path: 'business', select: '_id id name contact_no avatar avatar_address email' })
        .populate({ path: 'vendor', select: '_id id name contact_no avatar avatar_address email' })
        .populate({ path: 'address' })
        .populate({ path: 'vendor_address' })
        .exec();

    if (r) {
        var quotation = {
            _id: r._id,
            id: r._id,
            rfq_no: r.rfq_no,
            memo: r.memo,
            note: r.note,
            items: r.items,
            total: r.total,
            quotation_no: r.quotation_no,
            rfq: r.rfq,
            date: moment(r.date).tz(req.headers['tz']).format("YYYY-MM-DD"),
            business: r.business,
            address: r.address,
            vendor_address: r.vendor_address,
            vendor: r.vendor,
            status: r.status,
            log: r.log,
            created_at: moment(r.created_at).tz(req.headers['tz']).format('lll'),
            updated_at: moment(r.updated_at).tz(req.headers['tz']).format('lll'),
        }

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: quotation
        });
    } else {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Quotation not found",
            responseData: {}
        });
    }
});

router.get('/quotation/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;

    var loggedInDetails = await User.findById(decoded.user).exec();
    var r = await Quotation.find({ _id: req.query.quotation, vendor: loggedInDetails._id }).exec();
    if (r) {
        var products = req.body.items;
        if (products.length > 0) {
            for (var p = 0; p < products.length; p++) {
                if (products[p].lot != null && products[p].quantity != null) {
                    var product = await BusinessProduct.findOne({ part_no: products[p].part_no, business: business }).exec();
                    var tax_info = await Tax.findOne({ tax: products[p].tax }).exec();
                    if (tax_info) {
                        if (product) {

                            var rate = products[p].mrp;
                            var amount = products[p].mrp;
                            var tax_rate = tax_info.detail;
                            var base = amount

                            var discount = products[p].discount;

                            if (discount.indexOf("%") >= 0) {
                                discount = parseFloat(discount);
                                if (!isNaN(discount) && discount > 0) {
                                    var discount_total = amount * (discount / 100);
                                    amount = amount - parseFloat(discount_total.toFixed(2))
                                }
                            } else {
                                discount = parseFloat(discount);
                                if (!isNaN(discount) && discount > 0) {
                                    amount = amount - parseFloat(discount.toFixed(2))
                                }
                            }

                            if (products[p].amount_is_tax == "exclusive") {
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
                                        } else {
                                            var t = tax_on_amount * (tax_info.rate / 100);
                                            amount = amount + t;
                                            tax.push({
                                                tax: tax_info.tax,
                                                tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                    }
                                }
                                total = total + amount;
                            }

                            if (products[p].amount_is_tax == "inclusive") {
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
                                        } else {
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
                                //amount = products[p].mrp;
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }

                            if (product.unit) {
                                var unit = product.unit;
                            } else {
                                var unit = products[p].unit;
                            }

                            items.push({
                                product: product._id,
                                part_no: products[p].part_no,
                                hsn_sac: products[p].hsn_sac,
                                title: product.title,
                                quantity: products[p].quantity,
                                stock: products[p].quantity * products[p].lot,
                                sku: products[p].sku,
                                unit_price: products[p].unit_price,
                                unit: unit,
                                lot: products[p].lot,
                                mrp: products[p].mrp,
                                rate: products[p].rate,
                                base: base,
                                amount: amount,
                                models: product.models,
                                amount_is_tax: products[p].amount_is_tax,
                                sell_price: products[p].rate,
                                margin: products[p].margin,
                                discount: products[p].discount,
                                discount_type: products[p].discount_type,
                                discount_total: discount_total,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                            });

                            tax = [];
                        } else {
                            var rate = products[p].mrp;
                            var amount = products[p].mrp;
                            var tax_rate = tax_info.detail;
                            var base = amount
                            var discount = products[p].discount;

                            if (discount.indexOf("%") >= 0) {
                                discount = parseFloat(discount);
                                if (!isNaN(discount) && discount > 0) {
                                    var discount_total = amount * (discount / 100);
                                    amount = amount - parseFloat(discount_total.toFixed(2))
                                }
                            } else {
                                discount = parseFloat(discount);
                                if (!isNaN(discount) && discount > 0) {
                                    amount = amount - parseFloat(discount.toFixed(2))
                                }
                            }


                            if (products[p].amount_is_tax == "exclusive") {
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
                                        } else {
                                            var t = tax_on_amount * (tax_info.rate / 100);
                                            amount = amount + t;
                                            tax.push({
                                                tax: tax_info.tax,
                                                tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            })
                                        }
                                    }
                                }

                                total = total + amount;
                            }

                            if (products[p].amount_is_tax == "inclusive") {
                                amount = amount;
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
                                        } else {
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
                                //amount = products[p].mrp;
                                total = total + amount;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }

                            items.push({
                                product: null,
                                part_no: products[p].part_no,
                                hsn_sac: products[p].hsn_sac,
                                title: products[p].title,
                                quantity: products[p].quantity,
                                stock: products[p].quantity * products[p].lot,
                                lot: products[p].lot,
                                unit: products[p].unit,
                                sku: products[p].sku,
                                mrp: products[p].mrp,
                                rate: products[p].rate,
                                base: base,
                                amount: amount,
                                tax_amount: _.sumBy(tax, x => x.amount),
                                models: products[p].models,
                                amount_is_tax: products[p].amount_is_tax,
                                unit_price: products[p].unit_price,
                                sell_price: products[p].rate,
                                margin: products[p].margin,
                                discount: products[p].discount,
                                status: products[p].status,
                                discount_total: discount_total,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                            });

                            tax = [];
                        }
                    } else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Please check tax",
                            responseData: {}
                        });
                    }
                }
            }

            var total = _.sumBy(items, x => x.amount);


            var quotation = {
                items: items,
                total: total,
                updated_at: new Date(),
            };

            Quotation.findOneAndUpdate({ _id: r._id }, { $set: quotation }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error...",
                        responseData: err
                    });
                } else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Successfully Saved",
                        responseData: await Quotation.findById(r._id).exec()
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Items not found",
                responseData: {}
            });
        }
    } else {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Quotation not found",
            responseData: {}
        });
    }
});

router.get('/quotation/send', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;

    var loggedInDetails = await User.findById(decoded.user).exec();
    var r = await Quotation.find({ _id: req.query.quotation, vendor: loggedInDetails._id }).exec();
    if (r) {

    } else {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Quotation not found",
            responseData: {}
        });
    }
});

router.post('/purchase-order/edit', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var id = null;
    var result = [];
    var total = 0;
    var date = new Date(req.body.date).toISOString();

    var vendor = await User.findById(req.body.vendor).exec();
    var newDate = new Date();
    if (vendor) {
        var data = {
            order_no: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
            date: date,
            mailing_address: req.body.mailing_address,
            ship_to: req.body.ship_to,
            shipping_address: req.body.shipping_address,
            message: req.body.message,
            memo: req.body.memo,
            reference_no: req.body.reference_no,
            emails: req.body.emails,
            vendor: vendor._id,
            business: business,
            log: {
                status: "Open",
                remark: "",
                created_at: newDate,
                updated_at: newDate,
            },
            created_at: newDate,
            updated_at: newDate,
        };

        PurchaseOrder.create(data).then(async function (purchase) {
            var data = [];
            var products = req.body.items;
            id = purchase._id;
            products.forEach(async function (p) {
                var product = await BusinessProduct.findOne({ product: p.product }).exec();
                var tax_info = await Tax.findOne({ tax: p.tax }).exec();
                if (product) {
                    var tax = [];
                    var rate = p.rate;
                    var amount = p.rate * p.quantity;
                    var tax_rate = tax_info.detail;

                    if (p.amount_is_tax == "exclusive") {
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
                                } else {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t;
                                    tax.push({
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }
                        total = total + amount;
                    }

                    if (p.amount_is_tax == "inclusive") {
                        var x = (100 + tax_info.rate) / 100;
                        var tax_on_amount = amount / x;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                } else {
                                    var t = amount - tax_on_amount;
                                    tax.push({
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    });
                                }
                            }
                        }
                        total = total + amount;
                    }

                    var tax_info = {
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        rate: tax_info.rate,
                        detail: tax
                    }

                    var item = {
                        product: product.product,
                        part_no: product.part_no,
                        hsn_sac: product.hsn_sac,
                        title: product.title,
                        short_description: product.long_description,
                        quantity: p.quantity,
                        price: {
                            mrp: product.mrp,
                            rate: parseFloat(rate),
                            amount: amount,
                            amount_is_tax: p.amount_is_tax,
                        },
                        amount_is_tax: p.amount_is_tax,
                        tax_info: tax_info,
                    }

                    PurchaseOrder.findOneAndUpdate({ _id: purchase._id }, { $push: { items: item } }, { new: false }, async function (err, doc) {

                    });
                }

                PurchaseOrder.findOneAndUpdate({ _id: purchase._id }, { $set: { total: total } }, { new: false }, async function (err, doc) { });
            });
        })

        var update = await PurchaseOrder.findById(id).exec();

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Order has been placed",
            responseData: update
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Vendor not found",
            responseData: {}
        });
    }
});

router.get('/purchase-orders/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    await PurchaseOrder.find({ business: business })
        .limit(config.perPage).skip(config.perPage * page)
        .cursor()
        .eachAsync(async function (po) {
            var vendor = await User.findById(po.vendor).select("name email contact_no address_info").exec()
            result.push({
                vendor: vendor,
                _id: po._id,
                id: po.id,
                order_no: po.order_no,
                date: moment(po.date).tz(req.headers['tz']).format("YYYY-MM-DD"),
                business: business,
                log: po.log,
                total: po.total,
                created_at: moment(po.created_at).tz(req.headers['tz']).format('LL'),
                updated_at: moment(po.updated_at).tz(req.headers['tz']).format('LL'),
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Purchase Order",
        responseData: result
    });
});

router.get('/purchase-order/details/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var tax = [];
    var total = 0;
    var result = new Object();
    var po = await PurchaseOrder.findOne({ _id: req.query.id }).exec();
    if (po) {
        var vendor = await User.findById(po.vendor).select("name email contact_no address_info").exec();
        result = {
            _id: po._id,
            id: po.id,
            vendor: vendor,
            order_no: po.order_no,
            date: moment(po.date).tz(req.headers['tz']).format("YYYY-MM-DD"),
            mailing_address: po.mailing_address,
            ship_to: po.ship_to,
            shipping_address: po.shipping_address,
            message: po.message,
            memo: po.memo,
            emails: po.emails,
            items: po.items,
            total: po.total,
            log: po.log,
            created_at: moment(po.created_at).tz(req.headers['tz']).format('LL'),
            updated_at: moment(po.updated_at).tz(req.headers['tz']).format('LL'),
        }


        res.status(200).json({
            responseCode: 200,
            responseMessage: "Purchase Order",
            responseData: result
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Purchase order not found",
            responseData: result
        });
    }
});

router.post('/tax/calculator', xAccessToken.token, async function (req, res, next) {
    var rules = {
        tax: 'required',
        quantity: 'required',
        rate: 'required',
        amount_is_tax: 'required',
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
        var tax = []
        var tax_info = await Tax.findOne({ tax: req.body.tax }).exec();

        if (tax_info) {
            var rate = req.body.rate;
            var amount = req.body.rate * req.body.quantity;
            var tax_rate = tax_info.detail;


            if (req.body.discount) {
                var discount = req.body.discount;
                if (discount.indexOf("%") >= 0) {
                    discount = parseFloat(discount);
                    if (!isNaN(discount) && discount > 0) {
                        var discount_total = amount * (discount / 100);
                        amount = amount - parseFloat(discount_total.toFixed(2))
                    }
                } else {
                    discount = parseFloat(discount);
                    if (!isNaN(discount) && discount > 0) {
                        var discount_total = discount.toFixed(2);
                        amount = amount - parseFloat(discount.toFixed(2))
                    }
                }
            }

            if (req.body.amount_is_tax == "exclusive") {
                var tax_on_amount = amount;
                if (tax_rate.length > 0) {
                    for (var r = 0; r < tax_rate.length; r++) {
                        if (tax_rate[r].rate != tax_info.rate) {
                            var t = tax_on_amount * (tax_rate[r].rate / 100);
                            amount = amount + t;
                            tax.push({
                                tax: tax_rate[r].tax,
                                rate: tax_rate[r].rate,
                                amount_is_tax: req.body.amount_is_tax,
                                amount: parseFloat(t.toFixed(2)),
                            })
                        } else {
                            var t = tax_on_amount * (tax_info.rate / 100);
                            amount = amount + t;
                            tax.push({
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                amount_is_tax: req.body.amount_is_tax,
                                amount: parseFloat(t.toFixed(2)),
                            })
                        }
                    }
                }
            }

            if (req.body.amount_is_tax == "inclusive") {
                var x = (100 + tax_info.rate) / 100;
                var tax_on_amount = amount / x;
                if (tax_rate.length > 0) {
                    for (var r = 0; r < tax_rate.length; r++) {
                        if (tax_rate[r].rate != tax_info.rate) {
                            var t = tax_on_amount * (tax_rate[r].rate / 100);

                            tax.push({
                                tax: tax_rate[r].tax,
                                rate: tax_rate[r].rate,
                                amount_is_tax: req.body.amount_is_tax,
                                amount: parseFloat(t.toFixed(2)),
                            });
                        } else {
                            var t = amount - tax_on_amount;
                            tax.push({
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                amount_is_tax: req.body.amount_is_tax,
                                amount: parseFloat(t.toFixed(2)),
                            });
                        }
                    }
                }
            }

            var data = {
                rate: rate,
                quantity: req.body.quantity,
                amount: amount,
                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                discount: discount_total,
                tax: tax_info.tax,
                tax_rate: tax_info.rate,
                tax_info: tax
            }

            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: data
            })
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Invalid Tax Slab",
                responseData: {}
            })
        }
    }
});

router.get('/margin/calculator', xAccessToken.token, async function (req, res, next) {

    var margin = req.query.margin;
    var amount = parseFloat(req.query.amount);
    margin = margin.toString();
    if (margin.indexOf("%") >= 0) {
        margin = parseFloat(margin);
        if (!isNaN(margin) && margin > 0) {
            margin_total = amount * (margin / 100);
            amount = amount + margin_total
        }
    } else {
        margin_total = parseFloat(margin);
        amount = amount + margin_total
    }


    res.status(200).json({
        responseCode: 200,
        responseMessage: "Margin",
        responseData: {
            sell_price: amount
        }
    });
});

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
    } else {
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
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

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
                var filename = uuidv1() + '.' + extension;
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, filename);
                } else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/product",
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
    } else {
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
                } else {
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

router.get('/order/items/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = decoded.user;

    var page = Math.max(0, parseInt(page));
    var convenience = "";
    var orders = [];
    var order = await Order.findById(req.query.order).populate({ 'path': 'user' }).populate({ 'path': 'address' }).exec();
    if (order) {
        await OrderLine.find({ order: order._id, business: business })
            .populate({ 'path': 'product', select: 'stock' })
            .cursor().eachAsync(async (p) => {
                convenience = p.convenience;

                orders.push({
                    product: p.product.product,
                    order_no: p.order_no,
                    tracking_no: p.tracking_no,
                    _category: p._category,
                    category: p.category,
                    source: p.source,
                    cost: p.cost,
                    total: p.total,
                    discount: p.discount,
                    discount_type: p.discount_type,
                    discount_total: p.discount_total,
                    paid_cost: p.paid_cost,
                    title: p.title,
                    description: p.description,
                    quantity: p.quantity,
                    stock: p.product.stock,
                    tax_info: p.tax_info,
                    services: p.services,
                    log: p.log,
                    status: p.status,
                    created_at: p.created_at,
                    updated_at: p.updated_at,
                });
            })

        var data = {
            items: orders,
            payment: order.payment,
            due: order.due,
            address: order.address,
            convenience: convenience,
            status: order.status,
            user: {
                _id: order.user._id,
                id: order.user.id,
                name: order.user.name,
                contact_no: order.user.contact_no,
            },
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: data,
        })
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "success",
            responseData: orders,
        })
    }
});

router.get('/customers/orders/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var business = req.headers['business'];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    var orders = [];
    if (business) {
        await OrderLine.aggregate([{
            "$match": {
                business: mongoose.Types.ObjectId(business)
            }
        },
        { "$unwind": "$user" },
        {
            "$lookup": {
                "from": "User",
                "localField": "user",
                "foreignField": "_id",
                "as": "user"
            }
        },
        { "$unwind": "$order" },
        {
            "$lookup": {
                "from": "Order",
                "localField": "order",
                "foreignField": "_id",
                "as": "order"
            }
        },
        { "$unwind": "$product" },
        {
            "$lookup": {
                "from": "BusinessProduct",
                "localField": "product",
                "foreignField": "_id",
                "as": "product"
            }
        },
        { $group: { _id: '$order._id', data: { $push: '$$ROOT' } } },
        { $skip: config.perPage * page },
        { $limit: config.perPage }
        ])
            .allowDiskUse(true)
            .cursor({ batchSize: 10 })
            .exec()
            .eachAsync(async function (doc) {
                var data = doc.data;
                var stock = true;
                data.forEach(async function (d) {
                    if (d.product[0].stock.available <= 0) {
                        stock = false
                    }
                })

                var address = await Address.findById(doc.data[0].order[0].address).exec();
                var time_left = moment(doc.data[0].date).endOf('day').fromNow();

                if (time_left.includes("ago")) {
                    time_left = time_left;
                } else {
                    time_left = time_left.replace("in ", "") + " left";
                }

                orders.push({
                    _id: doc.data[0].order[0]._id,
                    id: doc.data[0].order[0]._id,
                    order_no: doc.data[0].order[0].order_no,
                    name: doc.data[0].user[0].name,
                    contact_no: doc.data[0].user[0].contact_no,
                    stock: stock,
                    address: address,
                    convenience: doc.data[0].convenience,
                    time_left: time_left,
                    status: doc.data[0].order[0].status,
                    created_at: moment(doc.data[0].order[0].created_at).tz(req.headers['tz']).format('lll'),
                    delivered_by: moment(doc.data[0].date).tz(req.headers['tz']).format('ll'),
                    time_slot: doc.data[0].time_slot,
                });
            });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: orders
        })
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Business not mention",
            responseData: {}
        })
    }
});
//Abhinav Offer Add Changes
async function createMultiOffer(data) {

    var expired_at = new Date(req.body.sDate);
    expired_at.setDate(expired_at.getDate() + parseInt(req.body.validity));

    // console.log(expired_at + " -- " + business + " -- " + req.body.name + " -- " + req.files[0].key + " -- " + req.body.description + " -- " + req.body.limit +
    //     " -- " + req.body.validity + " -- " + req.body.code + " -- " + req.body.category + " -- " + req.body.sDate + " -- " + req.body.featured + " -- " + req.body.featured)
    // req.body.business = business._id;
    req.body.business = business
    req.body.image = req.files[0].key;
    // req.body.geometry = business.geometry;
    // req.body.isCarEager = business.isCarEager;
    //Abhinav 
    req.body.name = data.name;
    req.body.description = data.description;
    req.body.code = data.code;
    req.body.limit = data.limit;

    req.body.start_date = new Date(data.sDate).toISOString()
    req.body.valid_till = expired_at
    req.body.end_date = expired_at
    req.body.featured = data.featured;
    req.body.publish = true;
    req.body.validity = parseInt(data.validity)
    //Abhinav
    req.body.discount = data.discount;
    req.body.created_at = new Date();
    req.body.updated_at = new Date();
    var ser = []

    if (data.category == "all") {
        ser = ['service', 'detailing', 'customization', 'collision']
    } else {
        ser = [req.body.category];
    }
    //WEBSITE
    // req.body.offer_details.category = req.body.category;
    // req.body.offer_details.description =req.body.type
    // req.body.offer_details.terms = ""
    // console.log("Length of Coupon = " + ser.length)
    for (i = 0; i < ser.length; i++) {

        req.body.category = ser[i];
        // console.log("Service " + ser[i])
        BusinessOffer.create(req.body).then(function (offer) {

            Coupon.create({
                for: "category",
                type: "percent",
                label: offer.category,
                usage_limit: offer.limit,
                physical: false,
                code: offer.code,
                business: offer.business,
                offer: offer._id,
                discount: offer.discount,
                // discount: 30,
                start_date: new Date(req.body.sDate).toISOString(),
                expired_at: expired_at.toISOString(),
                created_at: new Date(offer.start_date),
            }).then(function (offer) {
                // console.log("Offer Created")
            })

        });
    }
    // res.status(200).json({
    //     responseCode: 200,
    //     responseMessage: "Offer has been added",
    //     responseData: {
    //         // item: offer,
    //         category: ser

    //     }
    // });

    return ser;
}

router.get('/offers/list/test', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var filters = [];
    var totalResult = 0;

    var date = new Date();
    var to = moment(date, "YYYY-MM-DD").subtract(1, 'days');

    var thumbnail = [];
    req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

    if (req.query.query) {
        var filters = [];

        var page = 0;

        if (req.query.page == undefined) {
            page = 0;
        } else {
            page = req.query.page;
        }
        var page = Math.max(0, parseInt(page));
        //END
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            $or: [
                { 'name': { $regex: req.query.query, $options: 'i' } },
                { 'code': { $eq: req.query.query } },
                { 'category': { $regex: req.query.query, $options: 'i' } },
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

            ]
        };
        filters.push(specification);



        // totalResult = await BusinessOffer.aggregate(filters);

        // var specification = {};
        // specification['$skip'] = config.perPage * page;
        // filters.push(specification);

        // var specification = {};
        // specification['$limit'] = config.perPage;
        // filters.push(specification);
    } else if (req.query.status) { //Active and Inactive
        // console.log("Approval" + req.query.status)
        specification['business'] = mongoose.Types.ObjectId(business);
        if (req.query.status == "Active") {

            specification['publish'] = true;
        } else if (req.query.status == "InActive") {
            specification['publish'] = false;

        } else {
            specification['end_date'] = { "$lt": new Date() };
        }

        if (req.query.date && req.query.end_date) {
            date = new Date(req.query.date)
            to = new Date(req.query.end_date)
            // console.log("Date .... ", date, to)
            specification['created_at'] = { "$gt": date, "$lte": to };
        }

        filters.push(specification);
        // console.log("Query By Filters", filters)
    }
    var query = {
        "$match": {
            "$and": filters
        }
    }
    totalResult = await Booking.aggregate([query]);
    return res.json({
        query: query,
        total: totalResult
    })
    // console.log("Totallllll Result  ", totalResult.length)

    // var specification = {};
    // specification['$skip'] = config.perPage * page;
    // filters.push(specification);

    // var specification = {};
    // specification['$limit'] = config.perPage;
    // filters.push(specification);
    var sortQuery = { $sort: { 'created_at': -1 } };
    await Booking.aggregate([
        query,
        sortQuery,
        { $skip: 10 * page },
        { $limit: 10 }
    ])
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })

        .exec()
        .eachAsync(async function (booking) {
            var car = null;
            var user = null;
            var manager = null;
            var advisor = null;
            var driver = null;
            var technician = null;
            var surveyor = null;
            var lead = null;
            // console.log("Booking Id = " + booking._id)
            // if (booking.lead) {
            var AllBookings = await Booking.findById(booking._id)
                .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no email" } })
                .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
                .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email account_info business_info" } })
                .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email business_info address bank_details" } })
                .populate({ path: 'driver', populate: { path: 'user', select: "_id id name contact_no email" } })
                .populate({ path: 'technician', populate: { path: 'user', select: "_id id name contact_no email" } })
                .populate({ path: 'surveyor', populate: { path: 'user', select: "_id id name contact_no email" } })
                .populate({ path: 'lead', select: "_id id name contact_no email source category" })
                .populate({ path: 'car', select: '_id id title variant registration_no ic rc vin engine_no insurance_info manufacture_year purchased_year' })
                .exec();
            // console.log("Booking End At end " + booking._id)
            // }
            if (AllBookings) {

                if (AllBookings.car) {
                    car = {
                        title: AllBookings.car.title,
                        _id: AllBookings.car._id,
                        id: AllBookings.car.id,
                        vin: AllBookings.car.vin,
                        engine_no: AllBookings.car.engine_no,
                        registration_no: AllBookings.car.registration_no,
                        ic_address: AllBookings.car.ic_address,
                        rc_address: AllBookings.car.rc_address,
                        variant: AllBookings.car.variant,
                        manufacture_year: AllBookings.car.manufacture_year,
                        purchased_year: AllBookings.car.purchased_year,
                    }
                }

                if (AllBookings.manager) {
                    var email = "";
                    if (AllBookings.manager.email) {
                        email = AllBookings.manager.email;
                    }

                    manager = {
                        name: AllBookings.manager.name,
                        _id: AllBookings.manager._id,
                        id: AllBookings.manager.id,
                        contact_no: AllBookings.manager.contact_no,
                        email: email
                    }
                }
                if (AllBookings.user) {
                    var email = "";
                    if (AllBookings.user.email) {
                        email = AllBookings.user.email;
                    }

                    user = {
                        name: AllBookings.user.name,
                        _id: AllBookings.user._id,
                        id: AllBookings.user.id,
                        contact_no: AllBookings.user.contact_no,
                        email: email
                    }
                }

                if (AllBookings.advisor) {
                    var email = "";
                    if (AllBookings.advisor.email) {
                        email = AllBookings.advisor.email;
                    }
                    advisor = {
                        name: AllBookings.advisor.name,
                        _id: AllBookings.advisor._id,
                        id: AllBookings.advisor.id,
                        contact_no: AllBookings.advisor.contact_no,
                        email: email
                    }
                }
                if (booking.lead) {
                    lead = {
                        name: booking.lead.name,
                        _id: booking.lead._id,
                        id: booking.lead.id,
                        contact_no: booking.lead.contact_no,
                        source: booking.lead.source,
                    }
                }
                if (AllBookings.driver) {
                    var email = "";
                    if (AllBookings.driver.email) {
                        email = AllBookings.driver.email;
                    }
                    driver = {
                        name: AllBookings.driver.name,
                        _id: AllBookings.driver._id,
                        id: AllBookings.driver.id,
                        contact_no: AllBookings.driver.contact_no,
                        email: email
                    }
                }
                if (AllBookings.technician) {
                    var email = "";
                    if (AllBookings.technician.email) {
                        email = AllBookings.technician.email;
                    }
                    technician = {
                        name: AllBookings.technician.name,
                        _id: AllBookings.technician._id,
                        id: AllBookings.technician.id,
                        contact_no: AllBookings.technician.contact_no,
                        email: email
                    }
                }
                if (AllBookings.surveyor) {
                    var email = "";
                    if (AllBookings.surveyor.email) {
                        email = AllBookings.surveyor.email;
                    }
                    surveyor = {
                        name: AllBookings.surveyor.name,
                        _id: AllBookings.surveyor._id,
                        id: AllBookings.surveyor.id,
                        contact_no: AllBookings.surveyor.contact_no,
                        email: email
                    }
                }

            }
            var serverTime = moment.tz(new Date(), req.headers['tz']);

            var startDate = moment(serverTime, "DD.MM.YYYY");
            var endDate = moment(booking.delivery_date, "DD.MM.YYYY");

            var days_left = endDate.diff(startDate, 'days');
            // console.log("Contact NO :" + user.contact_no)
            if (user) {
                // console.log("Contact NO :" + user.contact_no)
                var firstLead = await Lead.findOne({ business: business, contact_no: user.contact_no }).sort({ created_at: 1 }).exec();
                // return res.json({ abhi: firstLead })
                // var leads = firstLead.pop();
                // return res.json({ abhi: leads })
                if (firstLead) {
                    lead = {
                        name: firstLead.name,
                        _id: firstLead._id,
                        id: firstLead.id,
                        contact_no: firstLead.contact_no,
                        source: firstLead.source,
                    }
                }
            } else {
                // console.log("NOt Found   } ")
            }

            // if ()
            bookings.push({
                _id: booking._id,
                id: booking._id,
                car: car,
                user: user,
                advisor: advisor,
                lead: lead,
                manager: manager,
                manager: manager,
                driver: driver,
                technician: technician,
                surveyor: surveyor,
                time_left: moment(booking.delivery_date).tz(req.headers['tz']).endOf('day').fromNow(),
                days_left: days_left,
                delivery_date: moment(booking.delivery_date).tz(req.headers['tz']).format('ll'),
                delivery_time: booking.delivery_time,
                status: _.startCase(booking.status),
                _status: booking.status,
                sub_status: booking.sub_status,
                job_no: booking.job_no,
                booking_no: booking.booking_no,
                created_at: moment(booking.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(booking.updated_at).tz(req.headers['tz']).format('lll'),
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: to,
        category: req.query.status,
        responseInfo: {
            //role: role.role,
            //filters: filters,
            query: query,
            totalResult: totalResult.length
        },
        responseData: offers,
    });


});

router.put('/offer/pause/resume/old', async function (req, res, next) {
    var data = [];
    // var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    // var secret = config.secret;
    // var decoded = jwt.verify(token, secret);
    // var user = decoded.user;
    // db.BookingCategory.updateMany({},{$set:{"model_file":"https://careager.s3.ap-south-1.amazonaws.com/Services(ALL)/Service/Model+Wise+Sample.xlsx","segments_file":"https://careager.s3.ap-south-1.amazonaws.com/Services(ALL)/Service/Segment+Wise+Sample.xlsx"}})
    // await BusinessOffer.find({ _id: req.body.publish })
    //     .sort({ position: 1 })
    //     .cursor().eachAsync(async (d) => {

    // await BusinessPlan.findByIdAndUpdate({})
    // console.log("Business " + business + "Offer  " + req.body.offer + "Publis " + req.body.publish)
    await BusinessOffer.findOneAndUpdate({ _id: req.body.offer, business: business }, {
        $set: {
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
            // console.log("Offer Updated " + doc.name)
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
                    // console.log("Coupon Updated" + cop.limit)
                }
            })
            // var json = ({
            //     responseCode: 200,
            //     responseMessage: "Offer has been edited",
            //     responseData: {
            //         item: doc,
            //     }
            // });
            // res.status(200).json(json)
        }

        // console.log("Publish Changed")
    });
    // });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Offer Status Changed",
        responseData: {}
    })
});

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
    } else {
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
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    }
});

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
                var filename = uuidv1() + '.' + extension;
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, filename);
                } else {
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
                            responseData: err
                        });
                    } else {
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
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Wrong image",
                    responseData: {}
                })
            }
        }
    });
});

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

            var from = new Date(ret[0]).toISOString();
            var to = new Date(ret[1]).toISOString();
        } else {
            var from = new Date(date.getFullYear(), date.getMonth(), 1);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
    } else if (req.query.type == "period") {
        if (req.query.query) {
            var query = parseInt(req.query.query);
        } else {
            var query = 7
        }

        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else {
        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 30);
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

                    var completed = await Booking.find({ advisor: management.user._id, is_services: true, status: "Completed", created_at: { $gte: from, $lte: to } }).count().exec();

                    analytics.push({
                        title: "Completed Booking",
                        count: completed
                    });



                    var inProcess = await Booking.find({ advisor: management.user._id, is_services: true, status: "In-Process", /* created_at:{$gte: from, $lte: to}*/ }).count().exec();

                    analytics.push({
                        title: "InProcess Booking",
                        count: inProcess
                    });

                    var rework = await Booking.find({ advisor: management.user._id, is_services: true, is_rework: true }).count().exec();

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
                } else if (management.role == "CRE") {
                    var analytics = [];
                    var leads = [];

                    var totalLeads = await Lead.find({ assignee: management.user._id, created_at: { $gte: from, $lte: to } }).count().exec();

                    var excludeLeads = await Lead.find({ psf: false, converted: false, "remark.status": "Closed", assignee: management.user._id, created_at: { $gte: from, $lte: to } }).count().exec();

                    var c = await Lead.find({ assignee: management.user._id, converted: true, updated_at: { $gte: from, $lte: to } }).exec();

                    var id = _.map(c, '_id');

                    var converted = await Booking.find({ lead: { $in: id }, status: { $nin: ["Rejected", "Cancelled", "Inactive", "EstimateRequested"] }, updated_at: { $gte: from, $lte: to } }).count();

                    var calc = totalLeads - excludeLeads;

                    var conversion = 0;
                    conversion = (converted / calc) * 100;

                    if (conversion) {
                        conversion = parseFloat(conversion.toFixed(2))
                    }

                    analytics.push({
                        title: "Total Leads",
                        count: totalLeads
                    });

                    analytics.push({
                        title: "Converted",
                        count: converted
                    });

                    analytics.push({
                        title: "Conversion",
                        count: conversion
                    });


                    var open = await Lead.find({ assignee: management.user._id, "remark.status": "Open" }).count().exec();
                    analytics.push({
                        title: "Open",
                        count: open
                    });

                    var follow_up = await Lead.find({ assignee: management.user._id, "remark.status": "Follow-Up" }).count().exec();
                    analytics.push({
                        title: "Follow Up",
                        count: follow_up
                    });

                    var pipeline = await Booking.find({ manager: management.user._id, converted: true, status: { $nin: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Rejected", "Cancelled", "Inactive"] } }).count().exec();

                    analytics.push({
                        title: "Estimate",
                        count: pipeline
                    });

                    var totalClosedLeads = await Lead.find({ assignee: management.user._id, "remark.status": "Closed" }).count().exec();
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

    managements = _(managements).groupBy(x => x.role).map((value, key) => ({ role: key, data: value })).value(),
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Analytics",
            responseData: managements
        });
});

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
                    } else {
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

                var filename = uuidv1() + '.' + extension;
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, filename);
                } else {
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
                } else if (req.body.category == "collision") {
                    var check = await Collision.findById(req.body.source).exec()
                } else if (req.body.category == "washing") {
                    var check = await Washing.findById(req.body.source).exec()
                } else if (req.body.category == "product") {
                    var check = await Product.findById(req.body.source).exec()
                } else if (req.body.category == "customization") {
                    var check = await Customization.findById(req.body.source).exec()
                } else {
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
                } else {
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
    } else {
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
                } else {
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

//Abhinav Sprint 6
router.get('/users/list/get', xAccessToken.token, async function (req, res, next) {
    var carsFilter = [];
    var segment = [];
    var filterBy = [];
    var booking = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    var page = Math.max(0, parseInt(page));
    var peoples = [];
    var date = new Date();
    if (req.query.type == "range") {
        if (req.query.query) {
            var query = req.query.query;
            var ret = query.split("to");

            var from = new Date(ret[0]);
            var to = new Date(ret[1]);
        } else {
            var from = new Date(date.getFullYear(), date.getMonth(), 1);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
    } else if (req.query.type == "period") {
        if (req.query.query) {
            var query = parseInt(req.query.query);
        } else {
            var query = 7
        }

        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    } else {
        var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 365);
        var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }


    filterBy['created_at'] = { $gte: from, $lte: to }

    if (req.query.segment) {
        var segment = req.query.segment;
        carsFilter['segment'] = { $in: segment.split(',') }
    }

    if (req.query.automaker) {
        var automaker = req.query.automaker;
        carsFilter['automaker'] = { $in: automaker.split(',') }
    }

    await User.find({ 'account_info.type': 'user', created_at: { $gte: from, $lte: to } })
        .select('name username email avatar avatar_address contact_no account_info created_at updated_at')
        .sort({ created_at: -1 }).skip(100 * page).limit(100)
        .cursor().eachAsync(async (user) => {
            var booking_date = "";
            var last_booking = await Booking.findOne({ user: user._id, status: { $ne: "Inactive" } }).sort({ created_at: -1 }).exec();
            if (last_booking) {
                booking_date = moment(last_booking.created_at).tz(req.headers['tz']).format('ll');
            }

            var feedback = null;

            var lead = await Lead.findOne({ user: user._id /*,type: "Feedback"*/ }).sort({ created_at: -1 }).exec();
            if (lead) {
                var assignee = await User.findById(lead.assignee).exec();

                if (assignee) {
                    var a = {
                        name: assignee.name,
                        email: assignee.email,
                        contact_no: assignee.contact_no,
                        _id: assignee._id,
                        _id: assignee._id,
                    }
                } else {
                    var a = null;
                }

                if (lead.follow_up == null) {
                    var follow_up = {}
                } else {
                    follow_up = lead.follow_up
                }

                var l = lead.remark;

                if (l) {
                    if (l.assignee_remark == "") {
                        l.assignee_remark = l.customer_remark
                    }
                    var remark = {
                        source: l.source,
                        type: l.type,
                        status: l.status,
                        customer_remark: l.customer_remark,
                        assignee_remark: l.assignee_remark,
                        assignee: a,
                        color_code: l.color_code,
                        created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                    }
                }

                feedback = {
                    user: lead.user,
                    name: lead.name,
                    contact_no: lead.contact_no,
                    email: lead.email,
                    _id: lead._id,
                    id: lead.id,
                    priority: lead.priority,
                    contacted: lead.contacted,
                    type: lead.type,
                    lead_id: lead.lead_id,
                    geometry: lead.geometry,
                    date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                    status: lead.status,
                    source: lead.source,
                    important: lead.important,
                    follow_up: follow_up,
                    remark: remark,
                    assignee: a,
                    created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                    updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                }
            }

            var cars = [];
            var segment = [];


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
                last_booking: booking_date,
                feedback: feedback,
                agent: user.agent,
                joined: moment(user.updated_at).tz(req.headers['tz']).format('ll'),
            });
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Success",
        responseData: peoples,
        responseInfo: {
            totalResult: await User.find({ 'account_info.type': 'user', created_at: { $gte: from, $lte: to } }).count().exec()
        }
    })
});

router.get('/users/get', xAccessToken.token, async function (req, res, next) {
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

    if (req.query.by == "category") {
        var query = {
            "$match": {
                category: mongoose.Types.ObjectId(req.query.query)
            }
        }
    } else if (req.query.by == "subcategory") {
        var query = { "$match": { subcategory: mongoose.Types.ObjectId(req.query.query) } }
    } else if (req.query.by == "brand") {
        var query = { "$match": { product_brand: mongoose.Types.ObjectId(req.query.query) } }
    } else if (req.query.by == "model") {
        var query = { "$match": { product_model: mongoose.Types.ObjectId(req.query.query) } }
    } else if (req.query.by == "id") {
        var query = { "$match": { product: mongoose.Types.ObjectId(req.query.query) } }
    } else {
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
        responseMessage: "success",
        responseData: {
            products: product
        }
    })
});

router.post('/products/offers/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];


    req.body.valid_till = new Date(req.body.valid_till).toISOString();
    req.body.business = business._id;
    req.body.isCarEager = business.isCarEager;
    req.body.created_at = new Date();
    req.body.updated_at = new Date();

    ProductOffer.create(req.body).then(function (offer) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Offer has been added",
            responseData: {
                item: offer,
            }
        });
    });
});

router.get('/taxes/get', async function (req, res, next) {
    var tz = req.headers['tz'];
    if (tz) {
        var country = await Country.findOne({ timezone: { $in: tz } }).exec();
        if (country) {
            var taxes = await Tax.find({ country: country._id, type: 'GST' }).sort({ count: -1 }).exec()
            result = await q.all(businessFunctions.removeDublicateDoumnets(taxes, "tax"));
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Tax Slabs",
                responseInfo: {
                    taxes: _.map(taxes, 'rate')
                },
                responseData: taxes,
            })
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Tax Slabs",
                responseData: {}
            })
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Tax Slabs",
            responseData: {}
        })
    }
});

router.get('/booking/taxes/get', async function (req, res, next) {
    var tz = req.headers['tz'];
    if (tz) {
        var booking = await Booking.findById(req.query.booking).exec();
        if (booking) {
            var country = await Country.findOne({ timezone: { $in: tz } }).exec();
            if (country) {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Tax Slabs",
                    responseData: await Tax.find({ country: country._id }).exec(),
                })
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Tax Slabs",
                    responseData: {}
                })
            }
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Tax Slabs",
            responseData: {}
        })
    }
});

router.get('/booking/car/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        booking: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Booking required",
            responseData: {
                res: validation.errors.all()
            }
        })
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];
        var currentDate = new Date();
        var car = [];

        var booking = await Booking.findById(req.query.booking).exec();

        if (booking) {
            var doc = await Car.findById(booking.car)
                .populate('bookmark')
                .populate('thumbnails')
                .populate({ path: 'user', select: 'name username avatar avatar_address address' })
                .populate({ path: 'variant', populate: { path: 'model' } })
                .exec();

            car.push({
                __v: 0,
                _id: doc._id,
                id: doc.id,
                title: doc.title,
                variant: doc.variant._id,
                registration_no: doc.registration_no,
                insurance_info: doc.insurance_info,
                engine_no: doc.engine_no,
                vin: doc.vin,
                premium: doc.premium,
                is_bookmarked: doc.is_bookmarked,
                user: doc.user,
            })

            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: car
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            })
        }
    }
});

router.get('/booked/services/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        booking: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Booking required",
            responseData: {
                res: validation.errors.all()
            }
        })
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];
        var currentDate = new Date();
        var car = [];

        var booking = await Booking.findById(req.query.booking).exec();

        if (booking) {

            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: booking.services
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            })
        }
    }
});

router.post('/booking/job/add', xAccessToken.token, async function (req, res, next) {
    var rules = {
        booking: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Booking required",
            responseData: {
                res: validation.errors.all()
            }
        })
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var business = req.headers['business'];

        var loggedInDetails = await User.findById(decoded.user).exec();

        var currentDate = new Date();
        var booking = await Booking.findOne({ _id: req.body.booking, business: business, status: { $nin: ["Completed", "CompleteWork", "QC", "Closed", "Ready", "Inactive", "Cancelled"] } }).exec();

        if (booking) {
            var insurance_company = await InsuranceCompany.findOne({ company: req.body.insurance_company }).exec();
            if (insurance_company) {
                var expire = "";
                if (req.body.expire) {
                    expire = new Date(req.body.expire).toISOString();
                }
                var insurance_info = {
                    policy_holder: req.body.policy_holder,
                    insurance_company: req.body.insurance_company,
                    gstin: insurance_company.gstin,
                    policy_no: req.body.policy_no,
                    premium: req.body.premium,
                    expire: expire
                };
            } else {
                var insurance_info = {
                    policy_holder: "",
                    insurance_company: "",
                    gstin: "",
                    policy_no: "",
                    premium: 0,
                    expire: null
                };
            }

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { status: "JobInitiated", sub_status: "JobInitiated", odometer: req.body.odometer, fuel_level: req.body.fuel_level, insurance_info: insurance_info, started_at: new Date(), job_no: new Date().valueOf() } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                } else {
                    Car.findOneAndUpdate({ _id: booking.car }, { $set: { odometer: req.body.odometer, fuel_level: req.body.fuel_level, vin: req.body.vin, engine_no: req.body.engine_no, insurance_info: insurance_info } }, { new: false }, async function (err, doc) {
                        if (err) {
                            return res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        } else {
                            var activity = {
                                user: loggedInDetails._id,
                                name: loggedInDetails.name,
                                stage: "NewJob",
                                activity: "JobInitiated",
                            };

                            fun.bookingLog(booking._id, activity);

                            var notify = {
                                receiver: [booking.user],
                                activity: "jobcard",
                                tag: "JobInititated",
                                source: booking._id,
                                sender: booking.business,
                                points: 0
                            }

                            fun.newNotification(notify);
                            event.jobSms(notify);
                            event.zohoLead(booking._id);

                            var updated = await Booking.findById(booking._id).exec();

                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Car has been added",
                                responseData: updated
                            });
                        }
                    });
                }
            });
        } else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "This job already exists " + booking.status,
                responseData: {}
            })
        }
    }
});

router.put('/quality/inspection/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    var file_type = "";

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/inspection',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];

                var filename = uuidv1() + '.' + extension;
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, filename);
                } else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/inspection",
                        Key: filename
                    };
                    s3.deleteObject(params, async function (err, data) {
                        var json = ({
                            responseCode: 422,
                            responseMessage: "Invalid extension",
                            responseData: {}
                        });
                        return res.status(422).json(json)
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
            return res.status(400).json(json)
        }

        if (req.files.length == 0) {
            var json = ({
                responseCode: 400,
                responseMessage: "Media is required",
                responseData: {}
            });
            return res.status(400).json(json)
        } else {

            var rules = {
                booking: 'required'
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
                    booking: req.body.booking,
                    index: req.body.index,
                    file: req.files[0].key,
                    type: file_type,
                    stage: "QC",
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                var jobInspection = new JobInspection(data);
                jobInspection.save();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "File has been uploaded",
                    responseData: jobInspection

                })
            }
        }
    });
});

router.put('/surveyor-info/update', xAccessToken.token, async function (req, res, next) {
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
    } else {
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
            } else {
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
                    } else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "User details updated...",
                            responseData: {},
                        })
                    }
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "User not found",
                responseData: {},
            })
        }
    }
});

let calculateTax = (service, servicePrice, taxType) => {

    let tax_rate = '';
    if (taxType == 'serviceTax') {
        tax_rate = service.tax_rate
    } else if (taxType == 'totalTax') {

        tax_rate = service.tax_info.tax_rate
        // console.log('Enter inside the total tax rate', tax_rate)
    }

    tax_info = service.tax_info.detail
    // console.log('Tax info....', tax_info)

    let x = (100 + Number(tax_rate)) / 100;
    let tax_on_amount = Number(servicePrice) / x
    let tax_amount = Number(servicePrice) - tax_on_amount

    if (taxType == 'serviceTax') {

        service.base = parseFloat(tax_on_amount.toFixed(2))
        service.rate = servicePrice
        service.amount = servicePrice
        service.tax_amount = parseFloat(tax_amount.toFixed(2))
        service.tax_info.base = parseFloat(tax_on_amount.toFixed(2))

    } else if (taxType == 'totalTax') {
        service.tax_info.base = parseFloat(tax_on_amount.toFixed(2))
    }

    tax_info.forEach(data => {
        let tax_rate = data.rate
        let tax_amount = tax_on_amount * (Number(tax_rate)) / 100
        data.amount = parseFloat(tax_amount.toFixed(2))
        // console.log(tax_amount)
    })

    return service;
}



/* 
    Description: This function is use to update the services prices.
    Args: 
        servicePrice: This variable contains the array of 
                      prices which the admin wants to update.
        
        service: This variable contains the object of the type 
                 of service that admin wants to change ex- collision, Services etc.
        
        type: This variable contains (labour or parts) string of which admin wants to
                change the prices
*/

let updateServicePrices = (servicePrice, service, type, item, serviceType) => {

    let totalAmount = 0
    let labourCost = 0
    let partsCost = 0
    let tax_data = {}
    // console.log("Your service type is here ........", type, servicePrice, item)
    for (let j = 0; j < service[type].length; j++) {
        if (item == service[type][j].item) {
            // console.log('Parts condition matched...')
            service[type][j].rate = servicePrice
            let newService = calculateTax(service[type][j], servicePrice, 'serviceTax')
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
        let newService = calculateTax(service, totalAmount, 'totalTax')
        Object.assign(tax_data, newService.tax_info)
        service.tax_info = tax_data
    }



    // type: This variable contains (labour or parts) string of which admin wants to
    //         change the prices


    let updateServicePrices = (servicePrice, service, type, item, serviceType) => {

        let totalAmount = 0
        let labourCost = 0
        let partsCost = 0
        let tax_data = {}

        for (let j = 0; j < service[type].length; j++) {
            if (item == service[type][j].item) {
                service[type][j].rate = servicePrice
                let newService = calculateTax(service[type][j], servicePrice, 'serviceTax')
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
        service.part_Cost = partsCost
        service.cost = totalAmount
        service.updated_at = new Date();
        if (serviceType == 'detailing') {
            let newService = calculateTax(service, totalAmount, 'totalTax')
            Object.assign(tax_data, newService.tax_info)
            service.tax_info = tax_data
        }
    }

}

router.post('/manual/estimate/', xAccessToken.token, async function (req, res, next) {
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];
        var labour_cost = 0;
        var part_cost = 0;
        var of_cost = 0;
        var due_amount = 0;
        var totalResult = 0;
        var bookingService = [];

        var loggedInDetails = await User.findById(decoded.user).exec();
        var booking = await Booking.findById(req.body.booking).exec();
        if (booking) {
            labour_cost = booking.payment.labour_cost;
            part_cost = booking.payment.part_cost;
            if (booking.payment.of_cost) {
                var of_cost = booking.payment.of_cost;
            }
            var services = req.body.services;

            for (var i = 0; i < services.length; i++) {
                var parts_visible = true;
                var part_tax = [];
                var labour_tax = [];
                var fitting_tax = [];
                var tax_detail = {};
                if (typeof services[i].quantity != "number" || parseInt(services[i].quantity) <= 0) {
                    var quantity = 1
                } else {
                    var quantity = parseInt(services[i].quantity)
                }

                //var labour_cost_updated = services[i].service, parseFloat(se

                var parts = services[i].parts;
                var part = [];

                if (parts.length > 0) {
                    part = parts
                } else {
                    parts_visible = false;
                    var tax_info = await Tax.findOne({ tax: "0% GST" }).exec();
                    // console.log(tax_info)
                    var tax_rate = tax_info.detail;
                    var service = services[i].service;
                    var amount = parseFloat(services[i].part_cost) * quantity;
                    var base = amount;
                    var part_tax = [];

                    var x = (100 + tax_info.rate) / 100;
                    var tax_on_amount = amount / x;
                    // console.log(tax_on_amount)
                    if (tax_rate.length > 0) {
                        for (var r = 0; r < tax_rate.length; r++) {
                            if (tax_rate[r].rate != tax_info.rate) {
                                var t = tax_on_amount * (tax_rate[r].rate / 100);
                                // console.log(t)
                                if (t > 0) {
                                    base = base - t;
                                } else {
                                    base = base;
                                }

                                part_tax.push({
                                    tax: tax_rate[r].tax,
                                    rate: tax_rate[r].rate,
                                    amount: parseFloat(t.toFixed(2))
                                });
                            } else {
                                /*if(tax_info.rate>0)
                                {
                                    tax_on_amount = parseFloat(tax_on_amount.toFixed(2))
                                }
                                else
                                {
                                    tax_on_amount = 0;
                                }
                                part_tax.push({
                                    tax: tax_info.tax,tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    amount: 
                                });*/

                                var t = amount - tax_on_amount;
                                base = base - t;
                                part_tax.push({
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    rate: tax_info.rate,
                                    amount: parseFloat(t.toFixed(2))
                                });

                            }
                        }
                    }

                    tax_detail = {
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        rate: tax_info.rate,
                        base: parseFloat(base.toFixed(2)),
                        detail: part_tax
                    }

                    part.push({
                        item: services[i].service,
                        source: null,
                        quantity: quantity,
                        hsn_sac: "",
                        part_no: "",
                        rate: parseFloat(services[i].part_cost),
                        base: parseFloat(base.toFixed(2)),
                        amount: parseFloat(amount),
                        tax_amount: _.sumBy(part_tax, x => x.amount),
                        amount_is_tax: "inclusive",
                        discount: 0,
                        customer_dep: 100,
                        insurance_dep: 0,
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        issued: false,
                        tax_info: tax_detail
                    })
                }

                var labour = services[i].labour;
                var labours = [];

                if (labour.length > 0) {
                    labours = labour
                } else {
                    var tax_info = await Tax.findOne({ tax: "18.0% GST" }).exec();
                    var tax_rate = tax_info.detail;
                    var service = services[i].service;
                    var amount = parseFloat(services[i].labour_cost) * quantity;
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
                            } else {
                                base = base - t
                                labour_tax.push({
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    rate: parseFloat(tax_info.rate.toFixed(2)),
                                    amount: parseFloat(tax_on_amount.toFixed(2))
                                })
                            }
                        }
                    }

                    labours.push({
                        item: services[i].service,
                        quantity: quantity,
                        rate: parseFloat(services[i].labour_cost),
                        base: parseFloat(base.toFixed(2)),
                        amount: parseFloat(amount),
                        discount: 0,
                        customer_dep: 100,
                        insurance_dep: 0,
                        amount_is_tax: "inclusive",
                        tax_amount: _.sumBy(labour_tax, x => x.amount),
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        tax_info: {
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            rate: tax_info.rate,
                            base: parseFloat(base.toFixed(2)),
                            detail: labour_tax
                        }
                    });
                }

                var opening_fittings = services[i].opening_fitting;
                var opening_fitting = [];

                if (opening_fittings.length > 0) {
                    opening_fitting = opening_fittings
                } else {
                    if (services[i].of_cost != 0) {
                        var tax_info = await Tax.findOne({ tax: "18.0% GST" }).exec();
                        var tax_rate = tax_info.detail;
                        var service = services[i].service;
                        var amount = parseFloat(services[i].of_cost) * quantity;
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
                                } else {
                                    base = base - t
                                    fitting_tax.push({
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
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
                            amount_is_tax: "inclusive",
                            customer_dep: 100,
                            insurance_dep: 0,
                            tax_amount: _.sumBy(fitting_tax, x => x.amount),
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: {
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                base: parseFloat(base.toFixed(2)),
                                detail: fitting_tax
                            }
                        });
                    } else {
                        opening_fitting = [];
                    }
                }

                bookingService.push({
                    source: services[i].source,
                    service: services[i].service,
                    mileage: services[i].mileage,
                    parts: part,
                    labour: labours,
                    opening_fitting: opening_fitting,
                    hours: services[i].hours,
                    parts_visible: parts_visible,
                    quantity: quantity,
                    discount: _.sumBy(labours, x => x.discount) + _.sumBy(part, x => x.discount) + _.sumBy(opening_fitting, x => x.discount),
                    description: services[i].description,
                    cost: _.sumBy(labours, x => x.amount) + _.sumBy(part, x => x.amount) + _.sumBy(opening_fitting, x => x.amount),
                    labour_cost: parseFloat(services[i].labour_cost),
                    of_cost: parseFloat(services[i].of_cost),
                    part_cost: parseFloat(services[i].part_cost),
                    exceeded_cost: parseFloat(services[i].exceeded_cost),
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

            var policy_clause = booking.payment.policy_clause;
            if (req.body.policy_clause >= 0 && req.body.policy_clause != null) {
                policy_clause = req.body.policy_clause;
            }

            var salvage = booking.payment.salvage;
            if (req.body.salvage >= 0 && req.body.salvage != null) {
                salvage = req.body.salvage;
            }

            var pick_up_charges = booking.payment.pick_up_charges;
            if (req.body.pick_up_charge >= 0) {
                pick_up_charges = req.body.pick_up_charge;
            }

            var approved = _.filter(bookingService, customer_approval => customer_approval.customer_approval == true);

            var paid_total = booking.payment.paid_total;
            var labour_cost = _.sumBy(bookingService, x => x.labour_cost);
            var part_cost = _.sumBy(bookingService, x => x.part_cost);
            var of_cost = _.sumBy(bookingService, x => x.of_cost);
            var discount_total = _.sumBy(bookingService, x => x.discount);

            var payment_total = labour_cost + part_cost + of_cost + discount_total + policy_clause + salvage + pick_up_charges;

            var estimate_cost = labour_cost + part_cost + of_cost + policy_clause + salvage + pick_up_charges - careager_cash;
            var careager_cash = booking.payment.careager_cash;

            var due_amount = _.sumBy(approved, x => x.labour_cost) + _.sumBy(approved, x => x.part_cost) + _.sumBy(approved, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (paid_total + careager_cash);

            var due = {
                due: Math.ceil(due_amount.toFixed(2))
            }


            var payment = {
                estimate_cost: estimate_cost,
                total: payment_total,
                careager_cash: careager_cash,
                of_cost: of_cost,
                labour_cost: labour_cost,
                part_cost: part_cost,
                payment_mode: booking.payment.payment_mode,
                payment_status: booking.payment.payment_status,
                discount_type: booking.payment.discount_type,
                coupon: booking.payment.coupon,
                coupon_type: booking.payment.coupon_type,
                discount_by: booking.payment.discount_by,
                discount: booking.payment.discount,
                discount_total: discount_total,
                policy_clause: policy_clause,
                salvage: salvage,
                terms: booking.payment.terms,
                pick_up_limit: booking.payment.pick_up_limit,
                pick_up_charges: pick_up_charges,
                paid_total: parseFloat(booking.payment.paid_total),
                discount_applied: booking.payment.discount_applied,
                transaction_id: booking.payment.transaction_id,
                transaction_date: booking.payment.transaction_date,
                transaction_status: booking.payment.transaction_status,
                transaction_response: booking.payment.transaction_response
            };

            var date = new Date();

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { package: req.body.package, services: bookingService, payment: payment, due: due, advance: req.body.advance, convenience: req.body.convenience, updated_at: date } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                } else {
                    var updated = await Booking.findById(booking.id).exec();
                    event.zohoLead(updated._id);

                    var activity = {
                        user: loggedInDetails._id,
                        name: loggedInDetails.name,
                        stage: "Estimation",
                        activity: "Estimate Prepared",
                    };

                    fun.bookingLog(booking._id, activity);
                    event.zohoLead(booking._id);

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Service has been added...",
                        responseData: updated
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            });
        }
    }
});

router.post('/approved/customer/services', xAccessToken.token, async function (req, res, next) {
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];
        var bookingService = [];
        var logged_remark = "";
        var loggedInDetails = await User.findById(decoded.user).exec();
        var booking = await Booking.findOne({ _id: req.body.booking, business: business }).exec();
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
                } else {
                    var quantity = parseInt(services[i].quantity)
                }

                var parts = services[i].parts;
                var part = [];
                if (parts.length > 0) {
                    part = services[i].parts
                    // console.log(services[i].parts)
                } else {
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
                                } else {
                                    base = base - t
                                    part_tax.push({
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(tax_on_amount.toFixed(2))
                                    });
                                }
                            }
                        }

                        tax_detail = {
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
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
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: tax_detail
                        })
                    }

                }

                var labours = services[i].labour;
                var labour = [];

                if (labours.length > 0) {
                    labour = labours
                } else {
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
                            } else {
                                base = base - t
                                labour_tax.push({
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
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
                        discount: 0,
                        customer_dep: 100,
                        insurance_dep: 0,
                        amount_is_tax: "inclusive",
                        tax_amount: _.sumBy(labour_tax, x => x.amount),
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        tax_info: {
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
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
                } else {
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
                                } else {
                                    base = base - t
                                    fitting_tax.push({
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
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
                            tax_amount: _.sumBy(fitting_tax, x => x.amount),
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: {
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                base: parseFloat(base.toFixed(2)),
                                detail: fitting_tax
                            }
                        })
                    }
                }

                if (services[i].customer_approval == true) {
                    var cost = _.sumBy(part, x => x.amount) + _.sumBy(labour, x => x.amount) + _.sumBy(opening_fitting, x => x.amount);
                    logged_remark = logged_remark + "-" + services[i].service + ": Rs/-" + cost + "\n";
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
                    discount: _.sumBy(labour, x => x.discount) + _.sumBy(part, x => x.discount) + _.sumBy(opening_fitting, x => x.discount),
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
            var pick_up_charges = booking.payment.pick_up_charges;

            var payment_total = labour_cost + part_cost + of_cost + discount_total + policy_clause + salvage + pick_up_charges;

            var estimate_cost = labour_cost + part_cost + of_cost + policy_clause + salvage + pick_up_charges - careager_cash;
            var careager_cash = booking.payment.careager_cash;

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

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { services: bookingService, payment: payment, due: due, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error Occurred Try again",
                        responseData: err
                    });
                } else {
                    if (booking.status == "JobOpen") {
                        var stage = "In-Process";
                        var status = "In-Process";

                        Booking.findOneAndUpdate({ _id: booking._id }, { $set: { status: status, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                            if (err) {
                                return res.status(400).json({
                                    responseCode: 400,
                                    responseMessage: "Error Occurred Try again",
                                    responseData: err
                                });
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
                    event.zohoLead(booking._id);

                    var updated = await Booking.findById(booking.id).exec();

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Service has been added...",
                        responseData: updated
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            });
        }
    }
});

router.post('/intimation/send', xAccessToken.token, async function (req, res, next) {
    var rules = {
        booking: 'required',
        email: 'required'
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var loggedInDetails = await User.findById(decoded.user).exec();
        var user = decoded.user;
        var business = req.headers['business'];
        var labour_cost = 0;
        var part_cost = 0;
        var of_cost = 0;
        var due_amount = 0;
        var totalResult = 0;
        var bookingService = [];

        var booking = await Booking.findById(req.body.booking).exec();
        if (booking) {
            if (booking.insurance_info.claim == true) {

                var services = booking.services;
                var claim = _.filter(services, claim => claim.claim == true);
                var labour_cost = _.sumBy(claim, x => x.labour_cost * x.quantity);
                var part_cost = _.sumBy(claim, x => x.part_cost * x.quantity);
                var of_cost = _.sumBy(claim, x => x.of_cost * x.quantity);


                var payment = {
                    total: labour_cost + part_cost + of_cost,
                    of_cost: of_cost,
                    labour_cost: labour_cost,
                    part_cost: part_cost,
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
                    pick_up_limit: 0,
                    pick_up_charges: 0,
                    paid_total: 0,
                    discount_applied: booking.payment.discount_applied,
                    transaction_id: booking.payment.transaction_id,
                    transaction_date: booking.payment.transaction_date,
                    transaction_status: booking.payment.transaction_status,
                    transaction_response: booking.payment.transaction_response
                };

                var due = {
                    due: part_cost + labour_cost + of_cost
                };

                if (claim.length > 0) {
                    Booking.findOneAndUpdate({ _id: booking._id }, { $set: { status: "ClaimIntimated", claimed: services, insurance_payment: payment, insurance_due: due } }, { new: false }, async function (err, doc) {
                        if (err) {
                            return res.status(400).json({
                                responseCode: 400,
                                responseMessage: "Error",
                                responseData: err
                            });
                        } else {
                            var activity = {
                                user: loggedInDetails._id,
                                name: loggedInDetails.name,
                                stage: "Estimation",
                                activity: "ClaimIntimated",
                            };

                            fun.bookingLog(booking._id, activity);
                            event.intimateMail(booking._id, req.body.email, req.headers['tz']);
                            return res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Claim has been intimated",
                                responseData: {}
                            });
                        }
                    });
                } else {
                    return res.status(400).json({
                        responseCode: 400,
                        responseMessage: "There is no service under claim!",
                        responseData: {}
                    });
                }
            } else {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Seems Jobcard is not open with insurance claim.",
                    responseData: {}
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];
        var bookingService = [];

        var booking = await Booking.findById(req.body.booking).exec();
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
                } else {
                    var quantity = parseInt(services[i].quantity)
                }

                var parts = services[i].parts;
                var part = [];

                if (parts.length > 0) {
                    part = parts
                } else {
                    if (services[i].part_cost != 0) {
                        parts_visible = false;
                        var tax_info = await Tax.findOne({ tax: "0% GST" }).exec();
                        var tax_rate = tax_info.detail;
                        var service = services[i].service;
                        var amount = parseFloat(services[i].part_cost) * quantity;
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
                                } else {
                                    base = base - t
                                    part_tax.push({
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(tax_on_amount.toFixed(2))
                                    });
                                }
                            }
                        }

                        tax_detail = {
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            rate: tax_info.rate,
                            base: parseFloat(base.toFixed(2)),
                            detail: part_tax
                        }

                        part.push({
                            item: services[i].service,
                            source: null,
                            quantity: quantity,
                            hsn_sac: "",
                            part_no: "",
                            rate: parseFloat(services[i].part_cost),
                            base: parseFloat(base.toFixed(2)),
                            amount: parseFloat(amount),
                            customer_dep: 100,
                            insurance_dep: 0,
                            tax_amount: _.sumBy(part_tax, x => x.amount),
                            amount_is_tax: "inclusive",
                            discount: 0,
                            issued: false,
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: tax_detail
                        })
                    } else {
                        part = []
                    }
                }

                var labour = services[i].labour;
                var labours = [];

                if (labour.length > 0) {
                    labours = labour
                } else {
                    var tax_info = await Tax.findOne({ tax: "18.0% GST" }).exec();
                    var tax_rate = tax_info.detail;
                    var service = services[i].service;
                    var amount = parseFloat(services[i].labour_cost) * quantity;
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
                            } else {
                                base = base - t
                                labour_tax.push({
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    rate: parseFloat(tax_info.rate.toFixed(2)),
                                    amount: parseFloat(tax_on_amount.toFixed(2))
                                })
                            }
                        }
                    }

                    labours.push({
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
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        tax_info: {
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
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
                } else {
                    if (services[i].of_cost != 0) {
                        var tax_info = await Tax.findOne({ tax: "18.0% GST" }).exec();
                        var tax_rate = tax_info.detail;
                        var service = services[i].service;
                        var amount = parseFloat(services[i].of_cost) * quantity;
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
                                } else {
                                    base = base - t
                                    fitting_tax.push({
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
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
                            tax_amount: _.sumBy(fitting_tax, x => x.amount),
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: {
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                base: parseFloat(base.toFixed(2)),
                                detail: fitting_tax
                            }
                        })
                    } else {
                        opening_fitting = [];
                    }
                }

                bookingService.push({
                    source: services[i].source,
                    service: services[i].service,
                    mileage: services[i].mileage,
                    parts: part,
                    labour: labours,
                    opening_fitting: opening_fitting,
                    hours: services[i].hours,
                    parts_visible: parts_visible,
                    quantity: quantity,
                    discount: _.sumBy(labours, x => x.discount) + _.sumBy(opening_fitting, x => x.discount) + _.sumBy(part, x => x.discount),
                    description: services[i].description,
                    cost: services[i].part_cost + _.sumBy(labours, x => x.amount) + services[i].of_cost,
                    labour_cost: parseFloat(services[i].labour_cost),
                    of_cost: parseFloat(services[i].of_cost),
                    part_cost: parseFloat(services[i].part_cost),
                    part_cost_editable: services[i].part_cost_editable,
                    labour_cost_editable: services[i].labour_cost_editable,
                    of_cost_editable: services[i].of_cost_editable,
                    type: services[i].type,
                    customer_approval: services[i].customer_approval,
                    surveyor_approval: services[i].claim,
                    claim: services[i].claim,
                    custom: services[i].custom,
                });
            }

            var claim = _.filter(bookingService, claim => claim.claim == true);
            var labour_cost = _.sumBy(claim, x => x.labour_cost * x.quantity);
            var part_cost = _.sumBy(claim, x => x.part_cost * x.quantity);
            var of_cost = _.sumBy(claim, x => x.of_cost * x.quantity);

            var insurance_payment = {
                total: labour_cost + part_cost + of_cost,
                of_cost: of_cost,
                labour_cost: labour_cost,
                part_cost: part_cost,
                payment_mode: booking.payment.payment_mode,
                payment_status: booking.payment.payment_status,
                coupon: "",
                coupon_type: "",
                discount_by: "",
                discount_type: "",
                discount: 0,
                discount_total: 0,
                policy_clause: 0,
                salvage: 0,
                terms: "",
                pick_up_limit: 0,
                pick_up_charges: 0,
                paid_total: 0,
                transaction_id: "",
                transaction_date: "",
                transaction_status: "",
                transaction_response: ""
            };

            var insurance_due = {
                due: part_cost + labour_cost + of_cost
            };

            var date = new Date();
            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { claimed: bookingService, services: bookingService, insurance_payment: insurance_payment, insurance_due: insurance_due, updated_at: new Date() } }, { new: false }, async function (err, doc) {
                if (err) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error Occurred Try again",
                        responseData: err
                    });
                } else {
                    var activity = {
                        user: user,
                        model: "Booking",
                        activity: "Surveyor Approved",
                    }

                    fun.bookingLog(booking._id, activity);

                    var updated = await Booking.findById(booking.id).exec();
                    let user = await User.findOne({ _id: mongoose.Types.ObjectId(updated.user) }).exec()
                    await whatsAppEvent.jobApproval(user.contact_no, booking.car)

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Service has been added...",
                        responseData: updated
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            });
        }
    }
});

router.get('/search/all', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var result = [];
    var data = {};
    var query = req.query.query;
    var type = req.query.type;

    if (query) {
        if (type == "user") {
            var users = [];
            await User.find({ "account_info.status": "Active" })
                .or([
                    { $or: [{ name: new RegExp(query, "i") }] },
                    { $or: [{ contact_no: new RegExp(query, "i") }] },
                ])
                .cursor()
                .eachAsync(async (user) => {
                    var b = await Booking.find({ business: business, user: user._id }).count();
                    var l = await Lead.find({ business: business, user: user._id }).count();
                    var o = await BusinessOrder.find({ business: business, user: user._id }).count();
                    if (b > 0 || l > 0 || o > 0) {
                        result.push({
                            name: user.name,
                            email: user.email,
                            contact_no: user.contact_no,
                            _id: user._id,
                            id: user._id,
                            type: "user"
                        });
                    }
                })

            data = {
                user: result
            }
        } else if (type == "booking") {
            var customer = await User.findOne({ contact_no: query }).exec();
            if (customer) {
                var search = {};
                search["user"] = mongoose.Types.ObjectId(customer._id)
                bookings.push(search);
            }

            var car = await Car.findOne({ reg_no_copy: query.replace(/\s/g, '') }).exec();
            if (car) {
                var search = {};
                search["car"] = mongoose.Types.ObjectId(car._id)
                bookings.push(search)
            }

            var search = {};
            if (!parseInt(query)) {
                query = 0;
            }

            search["booking_no"] = parseInt(query);
            bookings.push(search);

            var thumbnail = [];

            await Booking.find({
                business: business,
                status: {
                    $in: ["Pending", "Confirmed", "EstimateRequested", "Approved", "Approval", "Completed"]
                },
                $or: bookings
            })
                .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                .populate({ path: 'manager', populate: { path: 'user', select: "_id id name contact_no" } })
                .populate({ path: 'car', select: '_id id title registration_no ic rc', populate: { path: 'thumbnails' } })
                .cursor().eachAsync(async (booking) => {
                    var address = await Address.findOne({ _id: booking.address }).exec();
                    if (booking.car) {
                        if (booking.car.thumbnails[0]) {
                            var thumbnail = [booking.car.thumbnails[0]];
                        } else {
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
                    } else {
                        var car = null
                    }

                    var manager = null;
                    if (booking.manager) {
                        manager = {
                            name: booking.manager.name,
                            _id: booking.manager._id,
                            id: booking.manager.id,
                            contact_no: booking.manager.contact_no,
                            email: booking.manager.email
                        }
                    }

                    result.push({
                        _id: booking._id,
                        id: booking._id,
                        car: car,
                        user: {
                            name: booking.user.name,
                            _id: booking.user._id,
                            id: booking.user.id,
                            contact_no: booking.user.contact_no
                        },
                        manager: manager,
                        services: booking.services,
                        convenience: booking.convenience,
                        date: moment(booking.date).tz(req.headers['tz']).format('ll'),
                        time_slot: booking.time_slot,
                        status: booking.status,
                        booking_no: booking.booking_no,
                        address: address,
                        payment: booking.payment,
                        customer_requirements: booking.customer_requirements,
                        estimation_requested: booking.estimation_requested,
                        txnid: booking.txnid,
                        __v: booking.__v,
                        updated_at: booking.updated_at,
                        updated_at: booking.updated_at,
                        type: "Booking"
                    });
                });

            data = {
                booking: result
            }
        } else if (type == "order") {
            var customer = await User.findOne({ contact_no: query }).exec();
            if (customer) {
                var search = {};
                search["user"] = mongoose.Types.ObjectId(customer._id)
                bookings.push(search);
            }

            var search = {};
            search["order_no"] = query;
            bookings.push(search);

            // console.log(bookings)

            await OrderLine.aggregate([{
                "$match": {
                    "business": { $eq: mongoose.Types.ObjectId(business) },
                    "$or": bookings
                }
            },
            { "$unwind": "$user" },
            {
                "$lookup": {
                    "from": "User",
                    "localField": "user",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            { "$unwind": "$order" },
            {
                "$lookup": {
                    "from": "Order",
                    "localField": "order",
                    "foreignField": "_id",
                    "as": "order"
                }
            },
            { "$unwind": "$product" },
            {
                "$lookup": {
                    "from": "BusinessProduct",
                    "localField": "product",
                    "foreignField": "_id",
                    "as": "product"
                }
            },
            { $group: { _id: '$order._id', data: { $push: '$$ROOT' } } },
            { $skip: config.perPage * page },
            { $limit: config.perPage }
            ])
                .allowDiskUse(true)
                .cursor({ batchSize: 10 })
                .exec()
                .eachAsync(async function (doc) {
                    var data = doc.data;
                    var stock = true;
                    data.forEach(async function (d) {
                        if (d.product[0].stock.available <= 0) {
                            stock = false
                        }
                    })

                    var address = await Address.findById(doc.data[0].order[0].address).exec();
                    var time_left = moment(doc.data[0].date).endOf('day').fromNow();

                    if (time_left.includes("ago")) {
                        time_left = time_left;
                    } else {
                        time_left = time_left.replace("in ", "") + " left";
                    }

                    result.push({
                        _id: doc.data[0].order[0]._id,
                        id: doc.data[0].order[0]._id,
                        order_no: doc.data[0].order[0].order_no,
                        name: doc.data[0].user[0].name,
                        contact_no: doc.data[0].user[0].contact_no,
                        stock: stock,
                        address: address,
                        convenience: doc.data[0].convenience,
                        time_left: time_left,
                        status: doc.data[0].order[0].status,
                        created_at: moment(doc.data[0].order[0].created_at).tz(req.headers['tz']).format('lll'),
                        delivered_by: moment(doc.data[0].date).tz(req.headers['tz']).format('ll'),
                        time_slot: doc.data[0].time_slot,
                    });
                });

            data = {
                order: result
            }
        } else if (type == "lead") {
            await Lead.find({ "remark.status": { $in: ["Open", "Follow-Up", "PSF"] } })
                .or([
                    { $or: [{ lead_id: new RegExp(query, "i") }] },
                    { $or: [{ name: new RegExp(query, "i") }] },
                    { $or: [{ contact_no: new RegExp(query, "i") }] },
                ])
                .populate({ path: 'assignee', select: 'id name contact_no email' })
                .sort({ updated_at: -1 }).skip(config.perPage * page).limit(config.perPage)
                .cursor().eachAsync(async (lead) => {
                    if (lead) {
                        var remark = await LeadRemark.findOne({ lead: lead._id }).sort({ created_at: -1 }).exec();
                        result.push({
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

            data = {
                lead: result
            }
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        })
    } else {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        })
    }
});

router.get('/postal/get', async function (req, res, next) {
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
    } else {
        // var token = req.headers['x-access-token'];
        //var secret = config.secret;
        //  var decoded = jwt.verify(token, secret);
        //   var user = decoded.user;
        var data = {};

        request.get({ url: 'http://postalpincode.in/api/pincode/' + req.query.zip }, function (err, httpResponse, body) {
            if (!err) {
                var resBody = JSON.parse(body);

                if (resBody) {
                    var po = resBody.PostOffice;
                    if (po != null) {
                        data = {
                            city: resBody.PostOffice[0].Division,
                            state: resBody.PostOffice[0].State,
                        }
                    }
                }

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: data
                })
            }
        });
    }
});

router.post('/job/one/part/issue/UseLess', xAccessToken.token, async function (req, res, next) {
    // console.log("Issue Api")
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var data = [];
    var loggedInDetails = await User.findById(decoded.user).exec();
    var booking = await Booking.findById(req.body.booking).exec();


    if (booking) {
        var bookingService = [];
        var services = req.body.services;
        if (services.length > 0) {
            for (var i = 0; i < services.length; i++) {
                var update_parts = [];
                var parts = services[i].parts;
                // console.log("Parts Length " + services[i].parts.length)
                if (parts.length > 0) {
                    for (var k = 0; k < parts.length; k++) {
                        // console.log("Customer dep " + parts[k].customer_dep + " Insurence Dep " + parts[k].insurance_dep)
                        if (parseFloat(parts[k].customer_dep) == 0 && parseFloat(parts[k].insurance_dep) == 0) {
                            var customer_dep = 100;
                            var insurance_dep = 0;
                        } else {
                            var customer_dep = parseFloat(parts[k].customer_dep);
                            var insurance_dep = parseFloat(parts[k].insurance_dep);
                        }
                        // console.log("Source = " + parts[k].source)
                        if (parts[k].source != null && parts[k].issued == false) {
                            var businessProduct = await BusinessProduct.findById(parts[k].source).exec();

                            if (businessProduct.stock.available >= parts[k].quantity) {
                                var stockTotal = parseFloat(businessProduct.stock.total);
                                var stockAvailable = parseFloat(businessProduct.stock.available) - parts[k].quantity;
                                var stockConsumed = parseFloat(businessProduct.stock.consumed) + parts[k].quantity;

                                if (stockAvailable < 0) {
                                    stockAvailable = 0
                                }

                                if (stockConsumed < 0) {
                                    stockConsumed = 0
                                }

                                var stock = {
                                    total: stockTotal,
                                    available: stockAvailable,
                                    consumed: stockConsumed
                                };

                                update_parts.push({
                                    _id: parts[k]._id,
                                    source: parts[k].source,
                                    quantity: parts[k].quantity,
                                    issued: true,
                                    item: parts[k].item,
                                    hsn_sac: parts[k].hsn_sac,
                                    part_no: parts[k].part_no,
                                    quantity: parts[k].quantity,
                                    rate: parts[k].rate,
                                    base: parts[k].base,
                                    amount: parts[k].amount,
                                    customer_dep: customer_dep,
                                    insurance_dep: insurance_dep,
                                    tax_amount: parts[k].tax_amount,
                                    amount_is_tax: parts[k].amount_is_tax,
                                    discount: parts[k].discount,
                                    tax_rate: parts[k].tax_rate,
                                    tax: parts[k].tax,
                                    tax_info: parts[k].tax_info,
                                });

                                var activity = {
                                    user: loggedInDetails._id,
                                    name: loggedInDetails.name,
                                    stage: "Parts Updates",
                                    activity: parts[k].item + "(" + parts[k].part_no + ") has been issued.\n" + parts[k].quantity + "" + businessProduct.unit + "/ Price: " + parts[k].amount,
                                }

                                fun.bookingLog(booking._id, activity);

                                BusinessProduct.findOneAndUpdate({ _id: parts[k].source }, { $set: { stock: stock } }, { new: false }, async function (err, doc) {
                                    if (err) {
                                        // console.log(err)
                                    } else {

                                    }
                                });
                            } else {
                                update_parts.push({
                                    _id: parts[k]._id,
                                    source: parts[k].source,
                                    quantity: parts[k].quantity,
                                    issued: parts[k].issued,
                                    item: parts[k].item,
                                    hsn_sac: parts[k].hsn_sac,
                                    part_no: parts[k].part_no,
                                    quantity: parts[k].quantity,
                                    rate: parts[k].rate,
                                    base: parts[k].base,
                                    amount: parts[k].amount,
                                    customer_dep: customer_dep,
                                    insurance_dep: insurance_dep,
                                    tax_amount: parts[k].tax_amount,
                                    amount_is_tax: parts[k].amount_is_tax,
                                    discount: parts[k].discount,
                                    tax_rate: parts[k].tax_rate,
                                    tax: parts[k].tax,
                                    tax_info: parts[k].tax_info,
                                });
                            }
                        } else {
                            update_parts.push({
                                _id: parts[k]._id,
                                source: parts[k].source,
                                quantity: parts[k].quantity,
                                issued: parts[k].issued,
                                item: parts[k].item,
                                hsn_sac: parts[k].hsn_sac,
                                part_no: parts[k].part_no,
                                quantity: parts[k].quantity,
                                rate: parts[k].rate,
                                base: parts[k].base,
                                amount: parts[k].amount,
                                customer_dep: customer_dep,
                                insurance_dep: insurance_dep,
                                tax_amount: parts[k].tax_amount,
                                amount_is_tax: parts[k].amount_is_tax,
                                discount: parts[k].discount,
                                tax_rate: parts[k].tax_rate,
                                tax: parts[k].tax,
                                tax_info: parts[k].tax_info,
                            })
                        }
                    }
                } else {
                    update_parts = parts;
                }
                // console.log(" " + parts)
                bookingService.push({
                    part_cost: services[i].part_cost,
                    labour_cost: services[i].labour_cost,
                    of_cost: services[i].of_cost,
                    exceeded_cost: services[i].exceeded_cost,
                    quantity: services[i].quantity,
                    parts: update_parts,
                    labour: services[i].labour,
                    cost: _.sumBy(services[i].labour, x => x.amount) + _.sumBy(update_parts, x => x.amount) + _.sumBy(services[i].opening_fitting, x => x.amount),
                    discount: _.sumBy(services[i].labour, x => x.discount) + _.sumBy(update_parts, x => x.discount) + _.sumBy(services[i].opening_fitting, x => x.discount),
                    opening_fitting: services[i].opening_fitting,
                    part_cost_editable: services[i].part_cost_editable,
                    labour_cost_editable: services[i].part_cost_editable,
                    of_cost_editable: services[i].part_cost_editable,
                    description: services[i].description,
                    service: services[i].service,
                    type: services[i].type,
                    claim: services[i].claim,
                    custom: services[i].custom,
                    customer_approval: services[i].customer_approval,
                    surveyor_approval: services[i].surveyor_approval,
                    source: services[i].source,
                });
            }

            var approved = _.filter(bookingService, customer_approval => customer_approval.customer_approval == true);

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
            var pick_up_charges = booking.payment.pick_up_charges;
            var careager_cash = await q.all(fun.getBookingCarEagerCash(booking._id));
            var payment_total = labour_cost + part_cost + of_cost + discount_total + policy_clause + salvage + pick_up_charges;

            var estimate_cost = labour_cost + part_cost + of_cost + policy_clause + salvage + pick_up_charges - careager_cash;
            var due_amount = _.sumBy(approved, x => x.labour_cost) + _.sumBy(approved, x => x.part_cost) + _.sumBy(approved, x => x.of_cost) + policy_clause + salvage + pick_up_charges - (paid_total + careager_cash);

            var due = {
                due: Math.ceil(due_amount.toFixed(2))
            }

            var payment = {
                estimate_cost: estimate_cost,
                total: payment_total,
                careager_cash: careager_cash,
                of_cost: of_cost,
                labour_cost: labour_cost,
                part_cost: part_cost,
                payment_mode: booking.payment.payment_mode,
                payment_status: booking.payment.payment_status,
                coupon: booking.payment.coupon,
                coupon_type: booking.payment.coupon_type,
                discount_by: booking.payment.discount_by,
                discount_type: booking.payment.discount_type,
                discount: booking.payment.discount,
                discount_total: discount_total,
                policy_clause: policy_clause,
                salvage: salvage,
                terms: booking.payment.terms,
                pick_up_limit: booking.payment.pick_up_limit,
                pick_up_charges: pick_up_charges,
                paid_total: parseFloat(booking.payment.paid_total),
                discount_applied: booking.payment.discount_applied,
                transaction_id: booking.payment.transaction_id,
                transaction_date: booking.payment.transaction_date,
                transaction_status: booking.payment.transaction_status,
                transaction_response: booking.payment.transaction_response
            };

            Booking.findOneAndUpdate({ _id: booking._id }, { $set: { services: bookingService, payment: payment, due: due, updated_at: new Date() } }, { new: true }, async function (err, doc) {
                if (err) {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Error",
                        responseData: err
                    });
                } else {
                    var logsss = "";
                    for (i = 0; i < doc.services.length; i++) {

                        logsss = logsss + " \n " + doc.services[i].service + " :- \n"
                        partsss = doc.services[i].parts
                        labour = doc.services[i].labour
                        // console.log(partsss)
                        for (j = 0; j < partsss.length; j++) {
                            logsss = logsss + "\n PARTS Updates:-  " + partsss[j].item + " - " + partsss[j].quantity + "/ Price: " + partsss[j].amount
                        }
                        for (j = 0; j < labour.length; j++) {
                            logsss = logsss + "\n Labour Updates:- " + labour[j].item + " - " + labour[j].quantity + "/ Price: " + labour[j].amount
                        }
                        // console.log(logsss)
                    }

                    // for (i = 0; i < doc.services.length; i++) {

                    //     logsss = logsss + "\n" + doc.services[i].service + " :- \n"
                    //     labour = doc.services[i].labour
                    //     // console.log(labour)
                    //     for (j = 0; j < labour.length; j++) {
                    //         logsss = logsss + "\n Labour Updates:- " + labour[j].item + " - " + labour[j].quantity + "/ Price: " + labour[j].amount
                    //     }
                    // }
                    var activity = {
                        user: loggedInDetails._id,
                        name: loggedInDetails.name,
                        stage: "Stock Issue Updates",
                        activity: logsss
                        // activity: parts[k].item + "(" + parts[k].part_no + ") has been issued.\n" + parts[k].quantity + "" + businessProduct.unit + "/ Price: " + parts[k].amount,
                    }

                    fun.bookingLog(booking._id, activity);
                    var update = await Booking.findById(booking.id).exec();

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Parts has been added",
                        responseData: update
                    });
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Services not found",
                responseData: {}
            });
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking not found",
            responseData: {}
        });
    }
});

router.get('/job/qc/', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var data = [];
    var booking = await Booking.findById(req.query.booking).exec();
    if (booking) {
        var body = booking.services;

        var category = ["general"];
        body = _.uniqBy(body, "type");

        for (var i = 0; i < body.length; i++) {
            if (body[i].type == "addOn") {
                category.push("services")
            } else {
                category.push(body[i].type)
            }
        }

        var qc = [];

        await QualityCheck.find({ category: { $in: category } }).sort({ position: 1 })
            .cursor().eachAsync(async (p) => {
                var category = p.category;
                qc.push({
                    _id: p._id,
                    id: p._id,
                    position: p.position,
                    point: p.point,
                    category: category.toString(),
                })
            })

        res.status(200).json({
            responseCode: 200,
            responseMessage: "QC List",
            responseData: qc
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking not found",
            responseData: {}
        });
    }
});

router.put('/job/qc/update', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var data = [];
    var loggedInDetails = await User.findById(decoded.user).exec();
    var booking = await Booking.findById(req.body.booking).exec();
    if (booking) {
        var qc = _.orderBy(req.body.qc, 'position', 'asc');
        var status = req.body.status;

        var logs = _.filter(booking.logs, status => status.status == status);

        if (logs.length > 0) {
            status = logs[logs.length - 1].status
        }


        Booking.findOneAndUpdate({ _id: booking._id }, { $set: { qc: qc, status: status, updated_at: new Date() } }, { new: false }, async function (err, doc) {
            if (err) {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Error",
                    responseData: err
                });
            } else {
                var activity = {
                    user: loggedInDetails._id,
                    name: loggedInDetails.name,
                    stage: req.body.stage,
                    activity: req.body.status,
                };

                fun.bookingLog(booking._id, activity);

                var update = await Booking.findById(booking.id).exec();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Status has been updated",
                    responseData: update
                });
            }
        });

    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking not found",
            responseData: {}
        });
    }
});

router.get('/booking/conveniences/get', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var data = [];


    var businessConvenience = await BusinessConvenience.find({}).exec();
    if (businessConvenience.length > 0) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Conveniences",
            responseData: businessConvenience
        });
    } else {
        // business: null
        var businessConvenience = await BusinessConvenience.find({}).exec();
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Conveniences",
            responseData: businessConvenience
        });
    }
});

router.post('/order/convenience/add', xAccessToken.token, async function (req, res, next) {
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
                    var orderConvenience = await OrderConvenience.findOne({ business: business, convenience: body[i].convenience }).exec();
                    if (orderConvenience) {
                        var data = {
                            charges: body[i].charges,
                            updated_at: new Date()
                        }

                        OrderConvenience.findOneAndUpdate({ _id: orderConvenience._id }, { $set: data }, { new: false }, async function (err, doc) {
                            if (err) {
                                return res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error",
                                    responseData: err
                                });
                            }
                        });
                    } else {
                        var data = {
                            business: business,
                            convenience: body[i].convenience,
                            charges: body[i].charges,
                            created_at: new Date(),
                            updated_at: new Date()
                        }


                        OrderConvenience.create(data)
                            .then(async function (e) { });
                    }
                }

                var orderConvenience = await OrderConvenience.find({ business: business }).exec();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Conveniences",
                    responseData: orderConvenience
                });
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Convenience Required",
                    responseData: {}
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
                responseData: {}
            });
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        });
    }
});

async function getPackageDiscount(data) {
    var discount = {};
    if (data.package) {
        if (data.claim == false) {
            var package = await UserPackage.findOne({ _id: data.package }).exec();
            if (package) {
                if (package.status == true) {
                    if (package.car) {
                        var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
                    } else {
                        var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service }).count().exec();
                    }
                    // console.log("Package Used = " + packageUsed)
                    var serverTime = moment.tz(new Date(), data.tz);

                    var bar = package.created_at;
                    bar.setDate(bar.getDate() + package.validity);
                    bar = moment.tz(bar, data.tz)
                    var baz = bar.diff(serverTime);
                    // console.log(baz)
                    if (baz > 0) {
                        package.discount.forEach(async function (dis) {
                            // console.log(dis);
                            if (dis.for == "category") {
                                if (dis.label == data.category) {
                                    if (dis.type == "percent") {
                                        if (!packageDiscountOn.includes(data.service)) {
                                            discount = {
                                                discount: dis.discount,
                                                discount_type: "percent"
                                            }
                                        }
                                    } else {
                                        if (!packageDiscountOn.includes(data.service)) {
                                            discount = {
                                                discount: dis.discount,
                                                discount_type: "price"
                                            }
                                        }
                                    }
                                }
                            }
                            //test
                            // var getDiscount = {
                            //     booking: booking._id,
                            //     package: booking.package,
                            //     car: booking.car,
                            //     category: req.body.type,
                            //     service: req.body.service,
                            //     claim: req.body.claim,
                            //     tz: req.headers['tz']
                            // };
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
                                    } else if (dis.type == "fixed") {
                                        if (dis.limit > packageUsed) {
                                            packageDiscountOn.push(data.service)
                                            discount = {
                                                discount: dis.discount,
                                                discount_type: "fixed"
                                            }
                                        }
                                    } else {
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
                } else {
                    if (package.booking.equals(data.booking)) {
                        var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
                        var serverTime = moment.tz(new Date(), data.tz);
                        // console.log("Line Package 41183= " + packageUsed)
                        var bar = package.created_at;
                        bar.setDate(bar.getDate() + package.validity);
                        bar = moment.tz(bar, data.tz)
                        var baz = bar.diff(serverTime);
                        // console.log(baz);
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
                                        } else {
                                            if (!packageDiscountOn.includes(data.service)) {
                                                discount = {
                                                    discount: dis.discount,
                                                    discount_type: "price"
                                                }
                                            }
                                        }
                                    }
                                } else if (dis.for == "specific") {
                                    if (dis.label == data.service) {
                                        if (dis.type == "percent") {
                                            if (dis.limit > packageUsed) {
                                                packageDiscountOn.push(data.service)
                                                discount = {
                                                    discount: dis.discount,
                                                    discount_type: "percent"
                                                }
                                            }
                                        } else if (dis.type == "fixed") {
                                            if (dis.limit > packageUsed) {
                                                packageDiscountOn.push(data.service)
                                                discount = {
                                                    discount: dis.discount,
                                                    discount_type: "fixed"
                                                }
                                            }
                                        } else {
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
            }
        }
    }
    return discount;
}

async function packageDiscount(data) {
    var labour_cost = data.labour_cost;
    var lc = data.labour_cost;
    var package = await UserPackage.findOne({ _id: data.package }).exec();
    if (data.claim == false) {
        if (package) {
            if (package.status == true) {
                if (package.car) {
                    var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
                } else {
                    var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service }).count().exec();
                }

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
                                        labour_cost = lc - lc * (dis.discount / 100);
                                    }
                                } else if (dis.type == "fixed") {
                                    if (!packageDiscountOn.includes(data.service)) {
                                        labour_cost = lc - dis.discount

                                    }
                                } else {
                                    if (!packageDiscountOn.includes(data.service)) {
                                        labour_cost = lc - lc * (dis.discount / 100);

                                    }
                                }
                            }
                        } else if (dis.for == "specific") {
                            if (dis.label == data.service) {
                                if (dis.type == "percent") {
                                    if (dis.limit > packageUsed) {
                                        packageDiscountOn.push(data.service)
                                        labour_cost = lc - lc * (dis.discount / 100);

                                    }
                                } else if (dis.type == "fixed") {
                                    if (dis.limit > packageUsed) {
                                        packageDiscountOn.push(data.service)
                                        labour_cost = dis.discount;
                                    }
                                } else {
                                    if (dis.limit > packageUsed) {
                                        packageDiscountOn.push(data.service)
                                        labour_cost = lc - dis.discount;
                                    }
                                }
                            }
                        }
                    });
                }
            } else {
                if (package.booking.equals(data.booking)) {
                    var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
                    var serverTime = moment.tz(new Date(), data.tz);

                    var bar = package.created_at;
                    bar.setDate(bar.getDate() + package.validity);
                    bar = moment.tz(bar, data.tz)
                    var baz = bar.diff(serverTime);

                    if (baz > 0) {
                        package.discount.forEach(async function (dis) {

                            if (dis.for == "category") {
                                if (dis.label == cat) {
                                    if (dis.type == "percent") {
                                        if (!packageDiscountOn.includes(data.service)) {
                                            labour_cost = lc - lc * (dis.discount / 100);
                                        }
                                    } else if (dis.type == "fixed") {
                                        if (!packageDiscountOn.includes(data.service)) {
                                            labour_cost = lc - dis.discount

                                        }
                                    } else {
                                        if (!packageDiscountOn.includes(data.service)) {
                                            labour_cost = lc - lc * (dis.discount / 100);

                                        }
                                    }
                                }
                            } else if (dis.for == "specific") {
                                if (dis.label == data.service) {
                                    if (dis.type == "percent") {
                                        if (dis.limit > packageUsed) {
                                            packageDiscountOn.push(data.service)
                                            labour_cost = lc - lc * (dis.discount / 100);

                                        }
                                    } else if (dis.type == "fixed") {
                                        if (dis.limit > packageUsed) {
                                            packageDiscountOn.push(data.service)
                                            labour_cost = dis.discount;
                                        }
                                    } else {
                                        if (dis.limit > packageUsed) {
                                            packageDiscountOn.push(data.service)
                                            labour_cost = lc - dis.discount;
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
    }
    return labour_cost;
}

async function packageDeduction(id) {
    var booking = await Booking.findById(id).exec();
    if (booking.package) {
        var packageUsed = [];
        var package = await UserPackage.findOne({ _id: booking.package, car: booking.car }).exec();
        if (package) {
            if (package.status == false) {
                UserPackage.findOneAndUpdate({ _id: booking.package }, { "$set": { status: true } }, async function () { });
            }

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
                    } else if (dis.for == "category") {
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
}

async function stockEntry(purchase, product, business) {
    var part_no = product.part_no;
    part_no = part_no.replace(/,/g, ", ");
    part_no = part_no.toUpperCase();

    var businessProduct = await BusinessProduct.findOne({ part_no: part_no, unit: product.unit, business: business }).sort({ updated_at: -1 }).exec();

    var margin_total = 0;
    if (businessProduct) {
        if (businessProduct.price.rate == product.rate) {
            var tax = [];
            var tax_info = await Tax.findOne({ rate: parseFloat(product.tax_rate), type: "GST" }).exec();
            var rate = parseFloat(product.rate);
            var amount = parseFloat(product.rate);
            var tax_rate = tax_info.detail;
            var base = amount

            /*if(product.amount_is_tax=="exclusive")
            {
                var tax_on_amount = amount;
                if(tax_rate.length>0){
                    for(var r=0; r<tax_rate.length; r++)
                    {
                        if(tax_rate[r].rate != tax_info.rate)
                        {
                            var t = tax_on_amount*(tax_rate[r].rate/100);   
                            amount = amount+t;
                            tax.push({
                                tax: tax_rate[r].tax,
                                rate: tax_rate[r].rate,
                                amount: parseFloat(t.toFixed(2))
                            })
                        }
                        else{
                            var t = tax_on_amount*(tax_info.rate/100);   
                            amount = amount+t;
                            tax.push({
                                tax: tax_info.tax,tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                amount: parseFloat(t.toFixed(2))
                            })
                        }
                    }
                }
            }*/

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
                        } else {
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

            var checkSku = _.filter(businessProduct.sku, sku => sku.sku == product.sku);
            if (checkSku.length > 0) {
                var totalSkuStock = parseFloat(product.stock) + parseFloat(checkSku[0].total);
                var availSkuStock = parseFloat(product.stock) + parseFloat(checkSku[0].available);

                var sku = {
                    sku: product.sku,
                    total: totalSkuStock,
                    available: availSkuStock,
                }
            } else {
                var sku = {
                    sku: product.sku,
                    total: product.stock,
                    available: product.stock,
                }
            }

            let stockTotal = undefined
            let stockAvailable = undefined
            // vinay stocks
            // console.log("Stock entry called....")
            if (businessProduct.stock.total || businessProduct.stock.total > 0) {
                // console.log("Product stock total....", businessProduct.stock.total, product.stock, businessProduct.stock.total)

                if (businessProduct.stock.total != product.stock) {
                    stockTotal = parseFloat(product.stock)
                    stockAvailable = parseFloat(product.stock) - parseFloat(businessProduct.stock.consumed)
                } else {
                    stockTotal = parseFloat(businessProduct.stock.total)
                    stockAvailable = parseFloat(businessProduct.stock.available)
                }


            } else {

                stockTotal = parseFloat(businessProduct.stock.total) + parseFloat(product.stock);
                stockAvailable = parseFloat(businessProduct.stock.available) + parseFloat(product.stock);

            }

            var list_type = [];
            list_type = _.concat(businessProduct.list_type, "Offline");
            list_type = _.uniq(list_type);

            var purchases = [];
            purchases = _.concat(businessProduct.purchases, purchase);
            purchases = _.uniq(purchases);

            var data = {
                purchase: purchase,
                purchases: purchases,
                business: business,
                part_no: part_no,
                stock: {
                    total: stockTotal,
                    consumed: businessProduct.stock.consumed,
                    available: stockAvailable,
                },
                sku: sku,
                title: product.title,
                price: {
                    mrp: product.mrp,
                    rate: product.rate,
                    amount: amount,
                    sell_price: amount,
                    margin: product.margin,
                    margin_total: margin_total,
                },
                amount_is_tax: "inclusive",
                tax: tax_info.tax,
                tax_rate: tax_info.rate,
                tax_type: "GST",
                unit: product.unit,
                quantity: product.quantity,
                tax_info: tax_details,
                list_type: list_type,
                updated_at: new Date()
            };

            BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: data }, { new: true }, async function () {
                BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { "$pull": { "sku": { "sku": product.sku } } }, async function () { });
                BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku } }, { new: true }, async function () { });
                return true;
            });
        } else {
            var tax = [];
            var tax_info = await Tax.findOne({ rate: product.tax_rate, type: "GST" }).exec();
            var rate = product.rate;
            var amount = product.rate;
            var tax_rate = tax_info.detail;
            var base = amount
            /*if(product.margin){
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
            }*/

            /*if(product.amount_is_tax=="exclusive")
            {
                var tax_on_amount = amount;
                if(tax_rate.length>0){
                    for(var r=0; r<tax_rate.length; r++)
                    {
                        if(tax_rate[r].rate != tax_info.rate)
                        {
                            var t = tax_on_amount*(tax_rate[r].rate/100);   
                            amount = amount+t;
                            tax.push({
                                tax: tax_rate[r].tax,
                                rate: tax_rate[r].rate,
                                amount: parseFloat(t.toFixed(2))
                            })
                        }
                        else{
                            var t = tax_on_amount*(tax_info.rate/100);   
                            amount = amount+t;
                            tax.push({
                                tax: tax_info.tax,tax_rate: tax_info.rate,
                                rate: tax_info.rate,
                                amount: parseFloat(t.toFixed(2))
                            })
                        }
                    }
                }
            }  */

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
                        } else {
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
                total: product.stock,
                available: product.stock,
            };

            var stock = {
                total: product.stock,
                consumed: 0,
                available: product.stock,
            };

            var list_type = [];
            list_type = _.concat(businessProduct.list_type, "Offline");
            list_type = _.uniq(list_type);

            var purchases = [];
            purchases = _.concat(businessProduct.purchases, purchase);
            purchases = _.uniq(purchases);

            var data = {
                purchase: purchase,
                purchases: purchases,
                business: business,
                product: businessProduct.product,
                product_id: businessProduct.product_id,
                part_no: businessProduct.part_no,
                product_brand: businessProduct.product_brand,
                product_model: businessProduct.product_model,
                model: businessProduct.model,
                category: businessProduct.category,
                subcategory: businessProduct.subcategory,
                title: product.title,
                short_description: businessProduct.short_description,
                long_description: businessProduct.long_description,
                thumbnail: businessProduct.thumbnail,
                specification: businessProduct.specification,
                hsn_sac: businessProduct.hsn_sac,
                unit: businessProduct.unit,
                quantity: businessProduct.quantity,
                models: businessProduct.models,
                stock: stock,
                list_type: list_type,
                sku: sku,
                price: {
                    mrp: parseFloat(product.mrp),
                    rate: parseFloat(product.rate),
                    amount: amount,
                    sell_price: amount,
                    margin: product.margin,
                    margin_total: margin_total,
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
    } else {
        var tax = [];
        var tax_info = await Tax.findOne({ rate: parseFloat(product.tax_rate), type: "GST" }).exec();
        var rate = parseFloat(product.rate);
        var amount = parseFloat(product.rate);
        var tax_rate = tax_info.detail;
        var base = amount
        /*if(product.margin){
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

        /* if(product.amount_is_tax=="exclusive")
         {
             var tax_on_amount = amount;
             if(tax_rate.length>0){
                 for(var r=0; r<tax_rate.length; r++)
                 {
                     if(tax_rate[r].rate != tax_info.rate)
                     {
                         var t = tax_on_amount*(tax_rate[r].rate/100);   
                         amount = amount+t;
                         tax.push({
                             tax: tax_rate[r].tax,
                             rate: tax_rate[r].rate,
                             amount: parseFloat(t.toFixed(2))
                         })
                     }
                     else{
                         var t = tax_on_amount*(tax_info.rate/100);   
                         amount = amount+t;
                         tax.push({
                             tax: tax_info.tax,tax_rate: tax_info.rate,
                             rate: tax_info.rate,
                             amount: parseFloat(t.toFixed(2))
                         })
                     }
                 }
             }
         }*/

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
                    } else {
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
            total: product.stock,
            available: product.stock,
        };

        var stock = {
            total: product.stock,
            consumed: 0,
            available: product.stock,
        };

        var list_type = [];
        list_type.push("Offline");

        var purchases = [];
        purchases.push(purchase);

        var data = {
            purchase: purchase,
            purchases: purchases,
            business: business,
            product: null,
            product_id: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
            part_no: part_no,
            product_brand: null,
            product_model: null,
            model: null,
            category: null,
            subcategory: null,
            title: product.title,
            short_description: "",
            long_description: "",
            thumbnail: "",
            specification: "",
            hsn_sac: product.hsn_sac,
            quantity: product.quantity,
            unit: product.unit,
            models: product.models,
            stock: stock,
            sku: sku,
            list_type: list_type,
            price: {
                mrp: product.mrp,
                rate: product.rate,
                amount: amount,
                sell_price: amount,
                margin_total: margin_total,
                margin: product.margin,
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
            Purchase.findOneAndUpdate({ _id: purchase, items: { $elemMatch: { part_no: product.part_no } } }, { $set: { "items.$.product": bp._id } }, { new: false }, async function (err, doc) {
                if (err) {
                    // console.log(err)
                } else {
                    // console.log(bp._id)
                }
            });
        });
    }
}

async function stockRemove(purchase, product, business) {
    var part_no = product.part_no;
    part_no = part_no.replace(/,/g, ", ");
    part_no = part_no.toUpperCase();
    var businessProduct = await BusinessProduct.findOne({ purchase: purchase, part_no: part_no, business: business }).exec();

    var margin_total = 0;
    if (businessProduct) {
        var checkSku = _.filter(businessProduct.sku, sku => sku.sku == product.sku);
        if (checkSku.length > 0) {
            var totalSkuStock = parseFloat(checkSku[0].total) - parseFloat(product.stock);
            if (totalSkuStock < 0) {
                totalSkuStock = 0;
            }
            var availSkuStock = parseFloat(checkSku[0].available) - parseFloat(product.stock);
            if (availSkuStock < 0) {
                availSkuStock = 0;
            }
            var sku = {
                sku: product.sku,
                total: totalSkuStock,
                available: availSkuStock,
            }
        } else {
            var sku = {
                sku: product.sku,
                total: product.stock,
                available: product.stock,
            }
        }

        var stockTotal = parseFloat(businessProduct.stock.total) - parseFloat(product.stock);
        if (stockTotal < 0) {
            stockTotal = 0;
        }
        var stockAvailable = parseFloat(businessProduct.stock.available) - parseFloat(product.stock);
        if (stockAvailable < 0) {
            stockAvailable = 0;
        }
        let data = undefined

        if (businessProduct.stock.consumed || businessProduct.stock.consumed > 0) {
            // console.log("Enter Inside old Condition......")

            data = {
                stock: {
                    total: businessProduct.stock.total,
                    consumed: businessProduct.stock.consumed,
                    available: businessProduct.stock.available,
                },
                sku: sku,
                updated_at: new Date()
            };
        } else {
            // console.log("Enter Inside new Condition......")
            data = {
                stock: {
                    total: stockTotal,
                    consumed: stockTotal - stockAvailable,
                    available: stockAvailable,
                },
                sku: sku,
                updated_at: new Date()
            };
        }



        BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $set: data }, { new: false }, async function () {
            // console.log(data)
            BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { "$pull": { "sku": { "sku": product.sku } } }, async function () { });
            BusinessProduct.findOneAndUpdate({ _id: businessProduct._id, business: business }, { $push: { sku: sku } }, { new: true }, async function () { });
        });
    }
}

async function stockDeduction(product, booking) {
    var businessProduct = await BusinessProduct.findById(product.source).exec();
    if (businessProduct) {
        if (businessProduct.stock.available >= product.quantity) {
            var id = product._id;

            var stockTotal = parseFloat(businessProduct.stock.total);
            var stockAvailable = parseFloat(businessProduct.stock.available) - product.quantity;
            var stockConsumed = parseFloat(businessProduct.stock.consumed) + product.quantity;

            if (stockAvailable < 0) {
                stockAvailable = 0
            }

            if (stockConsumed < 0) {
                stockConsumed = 0
            }

            var stock = {
                total: stockTotal,
                available: stockAvailable,
                consumed: stockConsumed
            }

            BusinessProduct.findOneAndUpdate({ _id: product.source }, { $set: { stock: stock } }, { new: false }, async function (err, doc) {
                if (err) {
                    // console.log(err)
                } else {
                    Booking.findOneAndUpdate({
                        _id: booking,
                        services: {
                            $elemMatch: {
                                parts: {
                                    $elemMatch: {
                                        _id: id,
                                    }
                                }
                            }
                        }
                    }, {
                        $set: {
                            //"services.$.parts.$[].source": mongoose.Types.ObjectId(source),
                            "services.$.parts.$[].issued": true,
                        }
                    }, { new: true }, async function (err, doc) {
                        if (err) {
                            // console.log(err)
                        } else {
                            // console.log("Success")
                        }
                    });
                }
            });
        }
    }
}

async function orderItemReturn(product) {
    var businessProduct = await BusinessProduct.findById(product.product).exec();
    if (businessProduct) {
        var stockTotal = parseFloat(businessProduct.stock.total);
        var stockAvailable = parseFloat(businessProduct.stock.available) + product.quantity;
        var stockConsumed = parseFloat(businessProduct.stock.consumed) - product.quantity;

        if (stockAvailable < 0) {
            stockAvailable = 0
        } else if (stockAvailable > stockTotal) {
            stockAvailable = stockTotal
        }

        if (stockConsumed < 0) {
            stockConsumed = 0
        } else if (stockConsumed > stockTotal) {
            stockConsumed = stockTotal
        }

        var stock = {
            total: stockTotal,
            available: stockAvailable,
            consumed: stockConsumed
        }

        BusinessProduct.findOneAndUpdate({ _id: businessProduct.id }, { $set: { stock: stock } }, { new: false }, async function (err, doc) {
            if (err) {
                // console.log(err)
            } else {
                OrderLine.findOneAndUpdate({ _id: product._id }, { $set: { issued: false, status: "Confirmed" } }, { new: false }, async function (err, doc) { });
            }
        });
    }

    return true;
}

async function orderItemDeduct(order, business) {
    var bool = false;
    await OrderLine.find({ business: business, order: order })
        .cursor().eachAsync(async (orderLine) => {
            var businessProduct = await BusinessProduct.findById(orderLine.product).exec();
            // console.log("available: " + businessProduct.stock.available + " Required: " + orderLine.quantity)
            if (orderLine.issued == false) {
                if (businessProduct) {
                    if (businessProduct.stock.available >= orderLine.quantity) {
                        // console.log("drop")
                        var stockTotal = parseFloat(businessProduct.stock.total);
                        var stockAvailable = parseFloat(businessProduct.stock.available) - orderLine.quantity;
                        var stockConsumed = parseFloat(businessProduct.stock.consumed) + orderLine.quantity;

                        if (stockAvailable < 0) {
                            stockAvailable = 0
                        }

                        if (stockConsumed < 0) {
                            stockConsumed = 0
                        }

                        var stock = {
                            total: stockTotal,
                            available: stockAvailable,
                            consumed: stockConsumed
                        }

                        BusinessProduct.findOneAndUpdate({ _id: orderLine.product }, { $set: { stock: stock } }, { new: false }, async function (err, doc) {
                            if (err) {
                                return false;
                            } else {
                                OrderLine.findOneAndUpdate({ _id: orderLine._id }, { $set: { issued: true } }, { new: false }, async function (err, doc) { });
                            }
                        });
                    } else {
                        // console.log("drop no where")
                    }
                }
            }
        });

    var not_issued = [];
    var orderLines = await OrderLine.find({ business: business, order: order }).exec();

    var not_issued = _.filter(orderLines, issued => issued.issued == false);

    if (not_issued.length == 0) {
        bool = true
    }

    return bool
}

async function serviceAddOld(data, booking) {
    var booking = await Booking.findById(booking).exec();
    if (booking) {
        var car = await Car.findById(booking.car).populate('model').exec();
        var automaker = await Automaker.findById(car.model.automaker).exec();
        var bookingService = {
            package: data.sub_category, //
            automaker: automaker._id,
            _automaker: automaker.maker,
            model: car.model._id,
            _model: car.model.value,
            segment: car.model.segment,
            service: data.service,
            description: data.description,
            parts: data.parts,
            labour: data.labour,
            opening_fitting: data.opening_fitting,
            part_cost: data.part_cost,
            of_cost: data.of_cost,
            labour_cost: data.labour_cost,
            mileage: data.mileage, //
            cost: data.labour_cost + data.part_cost,
            mrp: data.mrp, //
            type: data.type,
            editable: data.editable, //
            labour_cost_editable: data.labour_cost_editable, //
            part_cost_editable: data.part_cost_editable, //
            of_cost_editable: data.of_cost_editable, //
            publish: false,
            cretaed_at: new Date()
        }

        // Blocking code by vinay
        if (data.type == "services") {
            await Service.create(bookingService)
        } else if (data.type == "collision") {
            await Collision.create(bookingService)
        } else if (data.type == "detailing") {
            await Detailing.create(bookingService)
        } else if (data.type == "customization") {
            await Customization.create(bookingService)
        }
    }
}
async function serviceAdd(data, booking) {
    var booking = await Booking.findById(booking).exec();
    if (booking) {

        var car = await Car.findById(booking.car).populate('model').exec();
        var automaker = await Automaker.findById(car.model.automaker).exec();
        // for (let i = 0; i < data.length; i++) {
        var margin_total = parseFloat(data.labour_cost) * (40 / 100);
        var mrp = parseFloat(data.labour_cost) + margin_total;
        // console.log("Sub Category  = " + data.sub_category)
        var partAll = []
        var parts = data.parts;
        for (let i = 0; i < data.parts.length; i++) {
            partAll.push({
                source: null,
                item: parts[i].item,
                hsn_sac: parts[i].hsn_sac,
                part_no: parts[i].part_no,
                quantity: parts[i].quantity,
                issued: false,
                rate: parseFloat(parts[i].rate),
                base: parseFloat(parts[i].base),
                amount: parseFloat(parts[i].amount),
                tax_amount: parts[i].tax_amount,
                amount_is_tax: parts[i].amount_is_tax,
                customer_dep: parts[i].customer_dep,
                insurance_dep: parts[i].insurance_dep,
                discount: parts[i].discount,
                tax: parts[i].tax,
                tax_rate: parts[i].tax_rate,
                tax_info: parts[i].tax_info
            })
            // console.log("Source  of  Part=  " + partAll[i].source + "\n IssuesIs  = " + partAll[i].issued);
        }
        var serviceData = {
            business: booking.business,
            package: data.sub_category,
            automaker: automaker._id,
            _automaker: automaker.maker,
            model: car.model._id,
            _model: car.model.value,
            segment: car.model.segment,
            service: data.service,
            description: data.description,
            parts: partAll,
            labour: data.labour,
            opening_fitting: data.opening_fitting,
            part_cost: data.part_cost,
            of_cost: data.of_cost,
            labour_cost: data.labour_cost,
            mileage: data.mileage,
            cost: parseFloat(data.part_cost) + parseFloat(data.labour_cost),
            mrp: parseFloat(data.part_cost) + Math.ceil(mrp),
            type: data.type,
            editable: true,
            labour_cost_editable: true,
            part_cost_editable: true,
            of_cost_editable: true,
            profile: "",
            publish: false,
            custom: true,
            status: "Custom",
            created_at: new Date(),
            updated_at: new Date(),
        }
        if (data.type == "services") {
            var ser = await Service.find({
                package: data.sub_category,
                model: { $ne: null },
                segment: car.model.segment,
                service: data.service,
                custom: true,
                business: booking.business
            }).exec();

            // return res.send(ser.type);
            // console.log(ser.length)
            if (ser.length) {
                // console.log("Service OLD " + ser.length)
                await Service.findOneAndUpdate({
                    package: data.sub_category,
                    model: { $ne: null },
                    segment: car.model.segment,
                    service: data.service,
                    custom: true,
                    business: booking.business
                }, {
                    $set: serviceData
                }, { new: true }, async function (err, doc) {
                    // console.log("Update  Service  _model = " + serviceData)
                });

            } else {
                // console.log("New Service  Service _model = " + serviceData + "   =  " + automaker + "   ")
                await Service.create(serviceData);
            }
        } else if (data.type == "collision") {
            var ser = await Collision.find({
                package: data.sub_category,
                model: { $ne: null },
                segment: car.model.segment,
                service: data.service,
                custom: true,
                business: booking.business
            }).exec();

            // return res.send(ser.type);
            // console.log(ser.length)
            if (ser.length) {
                // console.log(ser.length)
                await Collision.findOneAndUpdate({
                    package: data.sub_category,
                    model: { $ne: null },
                    segment: car.model.segment,
                    service: data.service,
                    custom: true,
                    business: booking.business
                }, {
                    $set: serviceData
                }, { new: true }, async function (err, doc) {
                    // console.log("Update Collision  _model = " + serviceData)
                });

            } else {
                // console.log("New Service Collision   _model = " + serviceData + "   =  " + automaker + "   ")
                await Collision.create(serviceData);
            }
        } else if (data.type == "detailing") {
            var ser = await Detailing.find({
                package: data.sub_category,
                model: { $ne: null },
                segment: car.model.segment,
                service: data.service,
                custom: true,
                business: booking.business
            }).exec();

            // return res.send(ser.type);
            // console.log(ser.length)
            if (ser.length) {
                // console.log(ser.length)
                await Detailing.findOneAndUpdate({
                    package: data.sub_category,
                    model: { $ne: null },
                    segment: car.model.segment,
                    service: data.service,
                    custom: true,
                    business: booking.business
                }, {
                    $set: serviceData
                }, { new: true }, async function (err, doc) {
                    // console.log("Update Detailing  _model = " + serviceData)
                });

            } else {
                // console.log("New Service  Detailing  _model = " + serviceData + "   =  " + automaker + "   ")
                await Detailing.create(serviceData);
            }
        } else if (data.type == "customization") {
            var ser = await Customization.find({
                package: data.sub_category,
                model: { $ne: null },
                segment: car.model.segment,
                service: data.service,
                custom: true,
                business: booking.business
            }).exec();

            // return res.send(ser.type);
            // console.log(ser.length)
            if (ser.length) {
                // console.log(ser.length)
                await Customization.findOneAndUpdate({
                    package: data.sub_category,
                    model: { $ne: null },
                    segment: car.model.segment,
                    service: data.service,
                    custom: true,
                    business: booking.business
                }, {
                    $set: serviceData
                }, { new: true }, async function (err, doc) {
                    // console.log("Update _model = Customization ")
                });

            } else {
                // console.log("New Service  _model Customization ")
                await Customization.create(serviceData);
            }
        }
    }
    // 
    // }
}


async function getAdvisor(user, business) {
    var advisor = business;
    var role = await Management.findOne({ user: user, business: business }).exec();
    if (role.role == "Service Advisor") {
        advisor = role.user;
    } else {
        var advisorBooking = [];
        await Management.find({ business: business, role: "Service Advisor" })
            .cursor().eachAsync(async (a) => {
                var d = await Booking.find({ business: business, advisor: a.user, status: { $in: ["EstimateRequested", "JobInitiated", "JobOpen", "In-Process", "StartWork", "Rework"] } }).count().exec();
                advisorBooking.push({
                    user: a.user,
                    count: d
                })
            });

        if (advisorBooking.length != 0) {
            advisorBooking.sort(function (a, b) {
                return a.count > b.count;
            });

            advisor = advisorBooking[0].user;
        } else {
            advisor = role.business
        }
    }

    return advisor;
}
//Abhinav
async function removeDublicateDoumnets(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
        newArray.push(lookupObject[i]);
    }

    return newArray;
}
// 

async function getUser(data) {
    if (data.name != "" && data.contact_no != "") {
        var user = await User.findOne({ contact_no: data.contact_no, "account_info.type": "user" }).exec();
        if (user) {
            return user._id
        } else {
            var name = data.name;
            var rand = Math.ceil((Math.random() * 100000) + 1);
            var id = mongoose.Types.ObjectId();

            var firstPart = (Math.random() * 46656) | 0;
            var secondPart = (Math.random() * 46656) | 0;
            firstPart = ("000" + firstPart.toString(36)).slice(-3);
            secondPart = ("000" + secondPart.toString(36)).slice(-3);
            var referral_code = firstPart.toUpperCase() + secondPart.toUpperCase();

            User.create({
                _id: id,
                name: data.name,
                rand: Math.floor((Math.random() * 100000) + 1),
                username: shortid.generate(),
                referral_code: referral_code,
                geometry: [0, 0],
                device: [],
                otp: Math.floor(Math.random() * 90000) + 10000,
                careager_cash: 0,
                socialite: "",
                optional_info: "",
                business_info: "",
                name: _.startCase(_.toLower(data.name)),
                email: data.email,
                optional_info: {},
                business_info: {},
                uuid: uuidv1(),
                contact_no: data.contact_no,
                uuid: uuidv1(),
                account_info: {
                    type: "user",
                    status: "Complete"
                },
                address: {
                    country: "India",
                    timezone: "Asia/Kolkata",
                    location: ""
                }
            }).then(async function (u) {
                event.signupSMS(u);
                //event.otpSms(u);
            });

            return id;
        }
    } else {
        return false;
    }
}

async function getCar(data) {
    var rg = data.registration_no;
    var reg_no_copy = rg.replace(/ /g, '');
    var car = await Car.findOne({ registration_no: reg_no_copy, status: true }).exec();
    if (car) {
        return car._id
    } else {
        var variant = await Variant.findOne({ _id: data.variant }).select('-service_schedule').exec();
        if (variant) {

            var reg = await Car.find({ registration_no: reg_no_copy, status: true }).count().exec();
            if (reg == 0) {
                var id = mongoose.Types.ObjectId();
                // console.log(id)
                Car.create({
                    _id: id,
                    geometry: [
                        0,
                        0
                    ],
                    registration_no: reg_no_copy,
                    reg_no_copy: reg_no_copy,
                    title: variant.variant,
                    variant: variant._id,
                    _variant: variant.value,
                    automaker: variant.automaker,
                    _automaker: variant._automaker,
                    model: variant.model,
                    _model: variant._model,
                    segment: variant.segment,
                    user: data.user,
                    fuel_type: variant.specification.fuel_type,
                    transmission: variant.specification.type,
                    carId: Math.round(new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                    created_at: new Date(),
                    updated_at: new Date()
                });

                return id;
            } else {
                return false;
            }
        }
    }
}

router.post('/packages/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var user = decoded.user;

    if (req.headers['business']) {
        user = req.headers['business'];
    }




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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;

        if (req.headers['business']) {
            user = req.headers['business'];
        }

        var bookingService = [];

        if (req.body.isCarEager == true) {
            var user = await User.find({ isCarEager: true }).select('name username avatar avatar_address gender business_info account_info address').sort({ created_at: -1 }).exec();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: user
            });
        } else {
            var car = await Car.findOne({ _id: req.body.car, user: user }).populate({ path: 'model', populate: { path: 'automaker' } });
            if (car) {
                var company = car.model.automaker.maker;
                var user = await User.find({
                    geometry: {
                        $near: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
                        $maxDistance: 1000,
                    },
                    "business_info.business_category": "Service Station (Authorised)",
                    /*"business_info.company": company*/
                })
                    .select('name username avatar avatar_address gender business_info account_info address')
                    .exec();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: user
                });
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Unauthorized",
                    responseData: {}
                });
            }
        }
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;

        if (req.headers['business']) {
            user = req.headers['business'];
        }



        var packages = [];

        if (!req.body.package) {
            req.body.package = null
        }

        var business = null;
        if (req.body.business) {
            business = req.body.business
        }


        var car = await Car.findOne({ _id: req.body.car, user: user }).populate('model').exec();
        if (car) {
            if (req.body.type == "services") {
                await Service.find({ business: business, segment: car.model.segment, part_cost: 0, publish: true, business: business })
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
                                    } else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    } else {
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
                                            } else {
                                                var t = amount - tax_on_amount;
                                                base = base - t;
                                                tax.push({
                                                    tax: tax_info.tax,
                                                    tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        //base = base - discount_total;
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
                                    customer_dep: 100,
                                    insurance_dep: 0,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }

                        if (service.opening_fitting.length != 0) {
                            service.opening_fitting[0].customer_dep = 100;
                            service.opening_fitting[0].insurance_dep = 0;
                        }

                        if (service.parts.length != 0) {
                            service.parts[0].customer_dep = 100;
                            service.parts[0].insurance_dep = 0;
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

                await Service.find({ business: business, model: car.model._id, publish: true, business: business })
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
                                    } else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    } else {
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
                                            } else {
                                                var t = amount - tax_on_amount;
                                                base = base - t;
                                                tax.push({
                                                    tax: tax_info.tax,
                                                    tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        //base = base - discount_total;
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
                                    customer_dep: 100,
                                    insurance_dep: 0,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }

                        if (service.opening_fitting.length != 0) {
                            service.opening_fitting[0].customer_dep = 100;
                            service.opening_fitting[0].insurance_dep = 0;
                        }

                        if (service.parts.length != 0) {
                            service.parts[0].customer_dep = 100;
                            service.parts[0].insurance_dep = 0;
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
                await Collision.find({ business: business, segment: car.model.segment, publish: true, business: business })
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
                                    } else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    } else {
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
                                            } else {
                                                var t = amount - tax_on_amount;
                                                base = base - t;
                                                tax.push({
                                                    tax: tax_info.tax,
                                                    tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        //base = base - discount_total;
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
                                    customer_dep: 100,
                                    insurance_dep: 0,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }

                        if (service.opening_fitting.length != 0) {
                            service.opening_fitting[0].customer_dep = 100;
                            service.opening_fitting[0].insurance_dep = 0;
                        }

                        if (service.parts.length != 0) {
                            service.parts[0].customer_dep = 100;
                            service.parts[0].insurance_dep = 0;
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
            } else if (req.body.type == "detailing") {
                await Detailing.find({ business: business, segment: car.model.segment, publish: true, business: business })
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
                                    } else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    } else {
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
                                            } else {
                                                var t = amount - tax_on_amount;
                                                base = base - t;
                                                tax.push({
                                                    tax: tax_info.tax,
                                                    tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        //base = base - discount_total;
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
                                    customer_dep: 100,
                                    insurance_dep: 0,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }

                        if (service.opening_fitting.length != 0) {
                            service.opening_fitting[0].customer_dep = 100;
                            service.opening_fitting[0].insurance_dep = 0;
                        }

                        if (service.parts.length != 0) {
                            service.parts[0].customer_dep = 100;
                            service.parts[0].insurance_dep = 0;
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
            } else if (req.body.type == "customization") {
                await Customization.find({ business: business, segment: car.model.segment, publish: true, business: business })
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
                                    } else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    } else {
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
                                            } else {
                                                var t = amount - tax_on_amount;
                                                base = base - t;
                                                tax.push({
                                                    tax: tax_info.tax,
                                                    tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        //base = base - discount_total;
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
                                    customer_dep: 100,
                                    insurance_dep: 0,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    tax_info: tax_details
                                });
                            }
                        }

                        if (service.opening_fitting.length != 0) {
                            service.opening_fitting[0].customer_dep = 100;
                            service.opening_fitting[0].insurance_dep = 0;
                        }

                        if (service.parts.length != 0) {
                            service.parts[0].customer_dep = 100;
                            service.parts[0].insurance_dep = 0;
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
            } else if (req.body.type == "package") {
                await Package.find({ business: business, label: "special" }).cursor().eachAsync(async (service) => {
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
                                    labour_cost: service.cost,
                                    part_cost: 0,
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
                            } else {
                                packages.push({
                                    service: service.name,
                                    mrp: 0,
                                    discount: service.discount,
                                    labour_cost: service.cost,
                                    part_cost: 0,
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
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {},
            });
        }
    }
});

router.post('/my/booking/package/add/', xAccessToken.token, async function (req, res, next) {
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;

        if (req.headers['business']) {
            user = req.headers['business'];
        }

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
            } else {
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
                } else {
                    var advisor = checkPackage.business
                }

                if (req.body.label == "Wheel Alignment" || req.body.label == "Wheel Balancing (cost per tyre, weights excluded)") {
                    var cond = { service: req.body.label, model: car.model, publish: true, };
                } else {
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
                                    } else if (package.discount_type == "fixed") {
                                        discount = parseFloat(package.discount);
                                        if (!isNaN(discount) && discount > 0) {
                                            var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                            amount = parseFloat(discount_total.toFixed(2))
                                            discount = amount - discount_total;
                                            if (amount < 0) {
                                                amount = 0
                                            }
                                        }
                                    } else {
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
                                            } else {
                                                var t = amount - tax_on_amount;
                                                base = base - t;
                                                tax.push({
                                                    tax: tax_info.tax,
                                                    tax_rate: tax_info.rate,
                                                    rate: tax_info.rate,
                                                    amount: parseFloat(t.toFixed(2))
                                                });
                                            }
                                        }

                                        //base = base - discount_total;
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
                                    customer_dep: labour_list[l].customer_dep,
                                    insurance_dep: labour_list[l].insurance_dep,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount_is_tax: labour_list[l].amount_is_tax,
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
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
                            customer_approval: true,
                            surveyor_approval: false,
                        });
                    });


                await Collision.find({ service: req.body.label, model: car.model._id }).cursor().eachAsync(async (service) => {
                    var getDiscount = {
                        package: checkPackage._id,
                        car: car._id,
                        category: service.type,
                        service: service.service,
                        tz: req.headers['tz'],
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
                                } else if (package.discount_type == "fixed") {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                        amount = parseFloat(discount_total.toFixed(2))
                                        discount = amount - discount_total;
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                } else {
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
                                        } else {
                                            var t = amount - tax_on_amount;
                                            base = base - t;
                                            tax.push({
                                                tax: tax_info.tax,
                                                tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }

                                    //base = base - discount_total;
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
                                customer_dep: labour_list[l].customer_dep,
                                insurance_dep: labour_list[l].insurance_dep,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount_is_tax: labour_list[l].amount_is_tax,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
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
                        customer_approval: true,
                        surveyor_approval: false,
                    });
                });

                await Detailing.find({ service: req.body.label, segment: car.model.segment }).cursor().eachAsync(async (service) => {
                    var getDiscount = {
                        package: checkPackage._id,
                        car: car._id,
                        category: service.type,
                        service: service.service,
                        tz: req.headers['tz'],
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
                                } else if (package.discount_type == "fixed") {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                        amount = parseFloat(discount_total.toFixed(2))
                                        discount = amount - discount_total;
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                } else {
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
                                        } else {
                                            var t = amount - tax_on_amount;
                                            base = base - t;
                                            tax.push({
                                                tax: tax_info.tax,
                                                tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }

                                    //base = base - discount_total;
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
                                customer_dep: labour_list[l].customer_dep,
                                insurance_dep: labour_list[l].insurance_dep,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount_is_tax: labour_list[l].amount_is_tax,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
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
                        customer_approval: true,
                        surveyor_approval: false,
                    });
                });

                await Customization.find({ service: req.body.label, model: car.model._id }).cursor().eachAsync(async (service) => {
                    var getDiscount = {
                        package: checkPackage._id,
                        car: car._id,
                        category: service.type,
                        service: service.service,
                        tz: req.headers['tz'],
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
                                } else if (package.discount_type == "fixed") {
                                    discount = parseFloat(package.discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        var discount_total = (amount / discount_eligible_labour_cost) * discount;
                                        amount = parseFloat(discount_total.toFixed(2))
                                        discount = amount - discount_total;
                                        if (amount < 0) {
                                            amount = 0
                                        }
                                    }
                                } else {
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
                                        } else {
                                            var t = amount - tax_on_amount;
                                            base = base - t;
                                            tax.push({
                                                tax: tax_info.tax,
                                                tax_rate: tax_info.rate,
                                                rate: tax_info.rate,
                                                amount: parseFloat(t.toFixed(2))
                                            });
                                        }
                                    }

                                    //base = base - discount_total;
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
                                customer_dep: labour_list[l].customer_dep,
                                insurance_dep: labour_list[l].insurance_dep,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount_is_tax: labour_list[l].amount_is_tax,
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
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
                        customer_approval: true,
                        surveyor_approval: false,
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

                var paid_total = part_cost + labour_cost + of_cost + pick_up_charges;
                var total = part_cost + labour_cost + of_cost + discount_total;

                var payment = {
                    estimate_cost: paid_total,
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
                    } else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Package successfully purchased, Book Services Now for added benefits",
                            responseData: booking
                        });
                    }
                });
            } else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Booking already exists for the same day. Please choose a different date or ask the advisor if anything needs to be added.",
                    responseData: {},
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {},
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
    } else {
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
            } else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }

        } else if (req.query.type == "collision") {
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
            } else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        } else if (req.query.type == "washing") {
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
            } else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        } else if (req.query.type == "detailing") {
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
            } else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        } else if (req.query.type == "customization") {
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
            } else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        } else if (req.query.type == "product") {
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
            } else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        } else if (req.query.type == "package") {
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
            } else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        } else if (req.query.type == "addOn") {
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
            } else {
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "",
                    responseData: {},
                });
            }
        } else {
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
    } else {
        var gallery = []
        if (req.query.type == "services") {
            var data = await Service.findById(req.query.id).exec();
            if (data) {
                if (Object.keys(data.gallery).length > 0) {
                    gallery = data.gallery;
                }
            }
        } else if (req.query.type == "collision") {
            var data = await Collision.findById(req.query.id).exec();
            if (data) {
                if (Object.keys(data.gallery).length > 0) {
                    gallery = data.gallery;
                }
            }
        } else if (req.query.type == "detailing") {
            var data = await Detailing.findById(req.query.id).exec();
            if (data) {
                if (Object.keys(data.gallery).length > 0) {
                    gallery = data.gallery;
                }
            }
        } else if (req.query.type == "customization") {
            var data = await Customization.findById(req.query.id).exec();
            if (data) {
                if (Object.keys(data.gallery).length > 0) {
                    gallery = data.gallery;
                }
            }
        }

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
        } else {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;

        if (req.headers['business']) {
            user = req.headers['business'];
        }

        var data = new Object();
        var discount = 0;
        var booking = await Booking.findById(req.body.id).exec();
        var coupon = await Coupon.findOne({ code: req.body.coupon, is_product: false }).exec();

        if (booking) {
            if (booking.status == "Inactive") {
                data = {
                    payment: {
                        payment_mode: "",
                        discount_type: "",
                        coupon: '',
                        coupon_type: '',
                        discount: 0,
                        discount_total: 0,
                        terms: booking.payment.terms,
                        pick_up_limit: Math.ceil(booking.payment.pick_up_limit),
                        pick_up_charges: Math.ceil(booking.payment.pick_up_charges),
                        labour_cost: Math.ceil(booking.payment.labour_cost),
                        part_cost: Math.ceil(booking.payment.part_cost),
                        paid_total: Math.ceil(booking.payment.paid_total),
                        total: Math.ceil(booking.payment.total),
                        discount_applied: false,
                        transaction_id: "",
                        transaction_date: "",
                        transaction_status: "",
                        transaction_response: ""
                    }
                };


                Booking.findOneAndUpdate({ _id: booking._id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Something went wrong",
                            responseData: err
                        })
                    } else {
                        if (req.body.type == "coupon") {
                            await CouponUsed.remove({ user: user, booking: booking._id }).exec();
                        }

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Coupon Removed",
                            responseData: data.payment
                        })
                    }
                });
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Unauthorized",
                    responseData: {}
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: {}
            });
        }
    }
});

router.get('/payment/data', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    if (req.headers['business']) {
        user = req.headers['business'];
    }

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
            } else {
                var booking = await Booking.findById(req.query.id).exec();
                if (booking.user == user) {
                    if (booking.due) {
                        var total = booking.due.due;
                        total = total.toFixed(2)
                    } else {
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

                } else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Unauthorized",
                        responseData: {}
                    });
                }
            }
        });
    } else {
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
            } else {
                var paid_total = booking.payment.paid_total + booking.due.due;
                var transaction = addZeroes(req.body.amount);

                var status = "Failure";
                req.body.order_status = "Decline";
                req.body.status_message = "Amount tampering found";
            }
        } else {
            if (addZeroes(booking.payment.paid_total) == addZeroes(req.body.amount)) {
                var paid_total = booking.payment.paid_total;
                var transaction = addZeroes(req.body.amount);
            } else {
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
            } else {
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
                } else {
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
                                    Booking.update({ "_id": booking._id }, { "$pull": { "services": { "source": service.source } } },
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
                                    } else if (dis.for == "category") {
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
                        } else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
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
                    } else {
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
        } else {
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
            } else {
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
                    } else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
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
    } else {
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

router.get('/payment/checksum/generate', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;

    if (req.headers['business']) {
        user = req.headers['business'];
    }

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
        } else {
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
            } else {
                var booking = await Booking.findById(req.query.id).exec();
                if (booking.user == user) {
                    if (booking.due) {
                        if (req.query.pay) {
                            var total = booking.due.pay;
                            total = parseFloat(total.toFixed(2))
                        } else {
                            var total = booking.due.due;
                            total = parseFloat(total.toFixed(2))
                        }
                    } else {
                        var total = booking.payment.paid_total;
                        total = parseFloat(total.toFixed(2))
                    }

                    var paramarray = {
                        MID: paytm_config.MID,
                        ORDER_ID: booking.order_id.toString(),
                        CUST_ID: user.toString(),
                        INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
                        CHANNEL_ID: "WEB",
                        TXN_AMOUNT: total.toString(),
                        WEBSITE: paytm_config.WEBSITE,
                        CALLBACK_URL: paytm_config.CALLBACK + 'theia/paytmCallback?ORDER_ID=' + booking.order_id.toString(),
                        EMAIL: getUser.email,
                        MOBILE_NO: getUser.contact_no
                    };

                    //res.json(paramarray)

                    paytm_checksum.genchecksum(paramarray, paytm_config.MERCHANT_KEY, function (err, data) {
                        // console.log("Paytm checksum..", data)
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "failure",
                                responseData: err
                            });
                        } else {
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Checksum generated",
                                responseData: data
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
    } else {
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

    if (req.headers['business']) {
        user = req.headers['business'];
    }


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
                } else {
                    var payment_due = booking.due.due;
                    var paid_total = parseFloat(payment_paid_total.toFixed(2)) + parseFloat(payment_due.toFixed(2));
                }
            } else {
                var paid_total = parseFloat(payment_paid_total.toFixed(2))

                User.findOneAndUpdate({ _id: booking.user }, {
                    $push: {
                        "bookings": booking._id
                    }
                }, { new: true }, async function (err, doc) {
                    if (err) {
                        // console.log(err)
                    } else {
                        // console.log(doc)
                    }
                });
            }

            var paramarray = {
                MID: paytm_config.MID,
                ORDER_ID: booking.order_id.toString(),
                CUST_ID: user.toString(),
                INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
                CHANNEL_ID: "WEB",
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
                    } else {
                        var paytmRes = JSON.parse(body);
                        if (paytmRes.STATUS == "TXN_SUCCESS") {
                            if (booking.sub_status != "") {
                                var stage = "In-Process";
                                var status = booking.status;
                            } else {
                                if (booking.date) {
                                    var d1 = booking.date;
                                    var date = new Date();
                                    var d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                    var seconds = (d1.getTime() - d2.getTime()) / 1000;
                                    if (seconds >= 172800) {
                                        var stage = "Booking";
                                        var status = "Confirmed";
                                    } else {
                                        var stage = "Booking";
                                        var status = "Pending";
                                    }
                                } else {
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
                                    } else {
                                        var due_info = null
                                    }
                                }
                            } else {
                                var due_info = null
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
                                } else {
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
                                                        points: package.cashback,
                                                        title: "",
                                                        body: "",
                                                        status: true
                                                    }

                                                    fun.addPoints(point)
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
                                                    } else if (dis.for == "category") {
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
                                        } else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
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
                                            responseMessage: "Payment Done",
                                            responseData: paytmRes
                                        });
                                    } else {
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
                        } else {
                            var data = {
                                status: "Failure",
                                payment: {
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
                                    } else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
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
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            });
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Booking Not Found",
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;

        if (req.headers['business']) {
            user = req.headers['business'];
        }

        var booking = await Booking.findById(req.body.id).exec();

        if (booking) {
            var transaction = await TransactionLog.findOne({ source: booking._id }).sort({ created_at: -1 }).exec()
            if (booking.payment.payment_status == "Success" || booking.payment.payment_status == "success") {

                let user = await User.findOne({ _id: mongoose.Types.ObjectId(booking.user) }).exec()

                await whatsAppEvent.payment_received(user.contact_no, booking.car);
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Payment Done",
                    responseData: {
                        booking_no: booking.booking_no,
                        payment: transaction,
                        is_services: booking.is_services
                    }
                });
            } else {
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
        } else {
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
    } else {
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
                    } else if (booking.payment.discount_type == "coupon" && booking.payment.discount_total != 0 && booking.payment.discount_total) {
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

        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Booking not found",
                responseData: req.body
            })
        }
    }
});

router.post('/car/publish', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);


    var published = await Car.find({ user: business, publish: true }).count().exec();

    var car = await Car.findById(req.body.car).populate('user').exec();
    var business = req.headers['business'];
    var limit = await q.all(businessPlanLimit(business, req.headers['tz']));
    if (limit.car_publish > published) {
        if (car) {
            if (loggedInDetails) {
                var check_listing = await CarSell.findOne({ car: car._id, buyer: null, sold: false }).exec();
                if (check_listing) {
                    if (!check_listing.seller.equals(check_listing.owner)) {
                        event.otp(car.user.contact_no, check_listing.otp);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "OTP has been sent to owner. Kindly Verify it.",
                            responseData: {
                                sell: check_listing._id
                            }
                        })
                    } else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Admin approval pending",
                            responseData: {
                                sell: null
                            }
                        })
                    }
                } else {
                    var log = {
                        user: loggedInDetails._id,
                        name: loggedInDetails.name,
                        status: "Published",
                        remark: "",
                        updated_at: new Date(),
                        created_at: new Date(),
                    };

                    var user_verified = false;

                    if (loggedInDetails._id.equals(car.user._id)) {
                        user_verified = true;
                    }

                    CarSell.create({
                        car: car._id,
                        seller: business,
                        owner: car.user._id,
                        buyer: null,
                        otp: Math.floor(Math.random() * 90000) + 10000,
                        user_verified: user_verified,
                        admin_verified: false,
                        logs: log,
                        created_at: new Date(),
                        updated_at: new Date(),
                    })
                        .then(async function (sell) {
                            var variant = await Variant.findOne({ _id: car.variant }).select('-service_schedule').exec();

                            Car.findOneAndUpdate({ _id: car._id }, {
                                $set: {
                                    posted_by: "business",
                                    user: sell.seller,
                                    variant: variant._id,
                                    _variant: variant.value,
                                    model: variant.model,
                                    _model: variant._model.value,
                                    automaker: variant.automaker,
                                    _automaker: variant._automaker,
                                    segment: variant.segment,
                                    title: variant.variant,
                                    publish: false,
                                    updated_at: new Date()
                                }
                            }, { new: false }, function (err, doc) {
                                if (err) {
                                    res.status(400).json({
                                        responseCode: 400,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    })
                                } else {
                                    if (user_verified == false) {
                                        event.otp(car.user.contact_no, check_listing.otp);
                                        res.status(200).json({
                                            responseCode: 200,
                                            responseMessage: "OTP has been sent to owner. Kindly Verify it.",
                                            responseData: {
                                                sell: sell._id
                                            }
                                        })
                                    } else {
                                        res.status(200).json({
                                            responseCode: 200,
                                            responseMessage: "Admin approval pending",
                                            responseData: {
                                                sell: null
                                            }
                                        })
                                    }

                                }
                            });
                        });
                }
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Seller not found",
                    responseData: {}
                })
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Unauthorized",
                responseData: {}
            })
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Limit Exceed",
            responseData: {}
        })
    }
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
                } else {
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
                        } else {
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
                                } else {
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
        } else {
            return res.status(400).json({
                responseCode: 400,
                responseMessage: "Car not found",
                responseData: {}
            })
        }
    } else {
        return res.status(400).json({
            responseCode: 400,
            responseMessage: "Listing not found",
            responseData: {}
        })
    }
});

router.get('/sold/cars/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
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
    } else {
        var token = req.headers['x-access-token'];
        var business = req.headers['business'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);

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
                    } else {
                        var paramarray = {
                            MID: paytm_config.MID,
                            ORDER_ID: sell._id.toString(),
                            CUST_ID: sell.seller._id.toString(),
                            INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
                            CHANNEL_ID: "WEB",
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
                            } else {
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "Checksum generated",
                                    responseData: data
                                });
                            }
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Package not found",
                    responseData: {}
                })
            }
        } else {
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
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var paramarray = new Object();
    var discount = 0;
    var sell = await CarSell.findOne({ _id: req.query.id, seller: business }).populate('seller').exec();
    var getUser = await User.findById(user).exec();
    if (sell) {
        var package = await Package.findOne({ _id: sell.package }).exec();

        var paramarray = {
            MID: paytm_config.MID,
            ORDER_ID: sell._id.toString(),
            CUST_ID: sell.seller._id.toString(),
            INDUSTRY_TYPE_ID: paytm_config.INDUSTRY_TYPE_ID,
            CHANNEL_ID: "WEB",
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
                } else {
                    var paytmRes = JSON.parse(body);
                    if (paytmRes.STATUS == "TXN_SUCCESS") {

                        CarSell.findOneAndUpdate({ _id: sell._id }, { $set: { package_sold: true } }, { new: false }, async function (err, doc) {
                            if (err) {
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Error Occurred",
                                    responseData: err
                                })
                            } else {


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
                    } else {
                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Your transaction has been declined",
                            responseData: paytmRes
                        })
                    }

                }
            });
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Car Not Found",
            responseData: {}
        });
    }
});

router.put('/car/rc/add', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = req.headers['business'];
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
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, filename);
                } else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/car",
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
                responseData: err
            });
            res.status(400).json(json)
        } else {
            var car = await Car.findOne({ _id: req.body.id, user: user }).exec();
            if (car) {
                if (car.ic) {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/car",
                        Key: car.rc
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
                    });
                }

                var data = {
                    rc: req.files[0].key,
                    updated_at: new Date,
                }

                Car.findOneAndUpdate({ _id: req.body.id, user: user }, { $set: data }, { new: true }, function (err, doc) { });

                var data = {
                    user: req.headers['business'],
                    car: req.body.id,
                    file_type: extension.toUpperCase(),
                    caption: "Registration No",
                    file: req.files[0].key,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                var carDocument = new CarDocument(data);
                carDocument.save();

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "File has been uploaded",
                    responseData: {
                        file_address: 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/car/' + req.files[0].key,
                    }
                })
            }
        }
    });
});

router.put('/car/ic/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = req.headers['business'];
    let extension = "";
    // var car = await Car.findById().exec();
    // res.json(req.body)
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
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, filename);
                } else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/car",
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
        } else {
            var car = await Car.findOne({ _id: req.body.id, user: user }).exec();
            if (car) {
                if (car.ic) {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/car",
                        Key: car.ic
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
                    });
                }

                var data = {
                    ic: req.files[0].key,
                    updated_at: new Date,
                }

                Car.findOneAndUpdate({ _id: req.body.id, user: user }, { $set: data }, { new: true }, function (err, doc) { });


                CarDocument.create({
                    user: req.headers['business'],
                    car: req.body.id,
                    file_type: extension.toUpperCase(),
                    caption: "Insurance",
                    file: req.files[0].key,
                    created_at: new Date(),
                    updated_at: new Date(),
                });


                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "File has been uploaded",
                    responseData: {
                        file_address: 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/car/' + req.files[0].key,
                    }
                })
            }
        }
    });
});

router.delete('/car/rc/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = req.headers['business'];

    if (!req.body.id) {
        var json = ({
            responseCode: 422,
            responseMessage: "Invalid Car",
            responseData: {}
        });
        res.status(422).json(json)
    } else {
        var car = await Car.findOne({ _id: req.body.id, user: user }).exec();
        if (car) {
            if (car.ic) {
                var params = {
                    Bucket: config.BUCKET_NAME + "/car",
                    Key: car.rc
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
                });
            }

            var data = {
                rc: '',
                updated_at: new Date,
            }

            Car.findOneAndUpdate({ _id: req.body.id, user: user }, { $set: data }, { new: true }, function (err, doc) { });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been deleted",
                responseData: {}
            })
        }
    }
});

router.delete('/car/ic/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = req.headers['business'];

    if (!req.body.id) {
        var json = ({
            responseCode: 422,
            responseMessage: "Invalid Car",
            responseData: {}
        });
        res.status(422).json(json)
    } else {
        var car = await Car.findOne({ _id: req.body.id, user: user }).exec();
        if (car) {
            if (car.ic) {
                var params = {
                    Bucket: config.BUCKET_NAME + "/car",
                    Key: car.ic
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
                });
            }

            var data = {
                ic: '',
                updated_at: new Date,
            }

            Car.findOneAndUpdate({ _id: req.body.id, user: user }, { $set: data }, { new: true }, function (err, doc) { });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been deleted",
                responseData: {}
            })
        }
    }
});

router.post('/car/add/image', xAccessToken.token, function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/car',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];

                var filename = uuidv1() + '.' + extension;
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif') {
                    cb(null, filename);
                } else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/car",
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
                car: req.body.id,
                file: req.files[0].key,
                created_at: new Date(),
                updated_at: new Date(),
            };

            var carImage = new CarImage(data);
            carImage.save();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been uploaded",
                responseData: {
                    item: carImage
                }
            })
        }
    });
});

async function businessPlan(business, category) {
    var plans = await BusinessPlan.find({ business: business, category: category }).populate('suite').exec();
    var suite = _.map(plans, 'suite');

    for (var i = 0; i < suite.length; i++) {
        var defaults = suite[i].default;
        for (var j = 0; j < defaults.length; j++) {
            var foundIndex = def.findIndex(x => x.action == defaults[j].action);
            if (foundIndex == -1) {
                def.push({
                    tag: defaults[j].tag,
                    module: defaults[j].module,
                    action: defaults[j].action,
                    enable: defaults[j].enable,
                    activityTab: defaults[j].activityTab,
                })
            }
        }

        var serverTime = moment.tz(new Date(), req.headers['tz']);
        var bar = plans[i].created_at;
        bar.setDate(bar.getDate() + plans[i].validity);
        var e = bar;
        bar = moment.tz(bar, req.headers['tz'])

        var baz = bar.diff(serverTime);

        if (baz > 0) {
            var mains = suite[i].main;
            for (var k = 0; k < mains.length; k++) {
                var foundIndex = main.findIndex(x => x.action == mains[k].action);
                if (foundIndex >= 0) {
                    main[foundIndex] = {
                        tag: mains[k].tag,
                        module: mains[k].action,
                        action: mains[k].action,
                        enable: mains[k].enable,
                        activityTab: mains[k].activityTab,

                    }
                } else {
                    main.push({
                        tag: mains[k].tag,
                        module: mains[k].module,
                        action: mains[k].action,
                        enable: mains[k].enable,
                        activityTab: mains[k].activityTab,
                    })
                }
            }
        }

        if (suite[i].chat == true) {
            chat = true;
        }
    }
}

async function businessPlanCategory(business) {
    var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
    var suite = _.map(plans, 'suite');

    var category = []

    for (var i = 0; i < suite.length; i++) {
        category.push(suite[i].category)
    }

    return category
}
async function offerGet(multi_category_no, business) {
    var offers = await BusinessOffer.find({ business: business }).sort({ _id: -1 }).exec();


    // var category = []

    // for (var i = 0; i < suite.length; i++) {
    //     category.push(suite[i].category)
    // }
    return offers
}
//Abhinav User Limit
// async function businessPlanUser(business) {
//     var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
//     var suite = _.map(plans, 'suite');
//     var users = 0;
//     if (plans) {
//         // console.log(plans.suit)
//     }
//     return users
// }
async function businessPlanLimit(business, tz) {
    var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
    var suite = _.map(plans, 'suite');
    // console.log(suite.length)
    // return res.json(suite.length)
    var limits = [];
    for (var i = 0; i < suite.length; i++) {
        var serverTime = moment.tz(new Date(), tz);
        var bar = plans[i].created_at;
        bar.setDate(bar.getDate() + plans[i].validity);
        var e = bar;
        bar = moment.tz(bar, tz)

        var baz = bar.diff(serverTime);
        // console.log("Limits ===" + suite[i].limits)
        if (baz > 0) {
            limits.push(suite[i].limits);

        }
    }


    result = limits.reduce((r, o) => {
        if (!typeof (o) === 'object' || o === null) {
            return r;
        }
        Object.keys(o).forEach((key) => r[key] = r[key] !== undefined ? Math.max(r[key], o[key]) : o[key]);
        return r;
    }, {});
    // console.log(result)
    return result;
}

//-------------------------------------//

// async function businessPlanLimit(business, tz) {
//     var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
//     // console.log("Business = " + business)
//     var suite = _.map(plans, 'suite');
//     // console.log(suite.length)
//     // return res.json(suite.length)
//     var limits = [];
//     for (var i = 0; i < suite.length; i++) {
//         var serverTime = moment.tz(new Date(), tz);
//         var bar = plans[i].created_at;
//         bar.setDate(bar.getDate() + plans[i].validity);
//         var e = bar;
//         bar = moment.tz(bar, tz)

//         var baz = bar.diff(serverTime);
//         // console.log("Limits ===" + suite[i].limits)
//         if (baz > 0) {
//             limits.push(suite[i].limits);

//         }
//     }
//     result = limits.reduce((r, o) => {
//         if (!typeof (o) === 'object' || o === null) {
//             return r;
//         }
//         Object.keys(o).forEach((key) => r[key] = r[key] !== undefined ? Math.max(r[key], o[key]) : o[key]);
//         return r;
//     }, {});
//     return result;
// }
//....................................//
// async function businessPlanLimit(business, tz) {
//     var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
//     // console.log("Business = " + business)
//     var suite = _.map(plans, 'suite');
//     // console.log(suite.length)

//     // return res.json(suite.length)
//     var limits = [];
//     for (var i = 0; i < suite.length; i++) {
//         var serverTime = moment.tz(new Date(), tz);
//         var bar = plans[i].created_at;
//         bar.setDate(bar.getDate() + plans[i].validity);
//         var e = bar;
//         bar = moment.tz(bar, tz)

//         var baz = bar.diff(serverTime);
//         // console.log("Baz Time " + bar + "  " + serverTime)
//         if (baz > 0) {
//             // console.log("Limits ===" + suite[i].limits)
//             limits.push(suite[i].limits);
//         }
//     }
//     // return limits;
//     result = limits.reduce((r, o) => {
//         if (!typeof (o) === 'object' || o === null) {
//             return r;
//         }
//         Object.keys(o).forEach((key) => r[key] = r[key] !== undefined ? Math.max(r[key], o[key]) : o[key]);
//         return r;
//     }, {});
//     return result;
// }


function price(value) {
    var val = Math.abs(value)
    if (val >= 10000000) {
        val = (val / 10000000).toFixed(2) + 'Cr';
    } else if (val >= 100000) {
        val = (val / 100000).toFixed(2) + 'L';
    } else if (val >= 1000) {
        val = (val / 1000).toFixed(2) + 'K';
    }
    return val.toString();
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

async function getAssignee(user, business) {
    var role = await Management.findOne({ user: user, business: business }).exec();
    if (role.role == "CRE") {
        advisor = role.user;
    } else {
        var assigneeLead = [];
        await Management.find({ business: business, role: "CRE" })
            .cursor().eachAsync(async (a) => {
                // var d = await Lead.find({ business: business, assignee: a.user }).count().exec();
                var open = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                var follow_up = await Lead.find({ business: business, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                var d = open + follow_up;

                assigneeLead.push({
                    user: a.user,
                    count: d
                })
            });

        if (assigneeLead.length != 0) {
            assigneeLead.sort(function (a, b) {
                return a.count > b.count;
            });

            advisor = assigneeLead[0].user;

        } else {
            advisor = role.business;
        }
    }


    return advisor;
}

router.put('/profile/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {
            var data = {
                name: req.body.name,
                contact_no: req.body.contact_no,
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
                User.findOneAndUpdate({ _id: business }, { $set: data }, { new: true }, function (err, doc) {
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
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
                responseData: {}
            });
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        });
    }
});

router.put('/booking/timings/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        var management = await Management.findOne({ user: decoded.user, business: business, role: "Admin" }).populate('user').exec();
        if (management) {
            var timings = req.body;
            BookingTiming.remove({ business: business }, function (err) {
                if (!err) {
                    if (timings.length > 0) {
                        timings.forEach(function (u) {
                            var timing = new BookingTiming({
                                business: business,
                                slot: u.slot,
                                sort: u.index,
                                booking_per_slot: u.bookings,
                                status: u.status,
                                created_at: new Date(),
                                updated_at: new Date(),
                            });
                            timing.save();
                        });

                        var json = ({
                            responseCode: 200,
                            responseMessage: "Booking timing has been updated",
                            responseData: {}
                        });
                        res.status(200).json(json)
                    } else {
                        var json = ({
                            responseCode: 400,
                            responseMessage: "Error Occurred",
                            responseData: {}
                        });
                        res.status(400).json(json)
                    }
                } else {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Error Occurred",
                        responseData: {}
                    });
                    res.status(400).json(json)
                }
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Authorization Error",
                responseData: {}
            });
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        });
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

router.get('/lead-gen/details/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        lead: 'required'
    };
    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "lead required",
            responseData: {
                res: validation.errors.all()
            }
        });
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers['business'];
        var totalResult = 0;

        var lead = await LeadGen.findOne({ _id: req.query.lead }).populate('remarks').exec();
        // console.log(lead._id)
        if (lead) {

            var logs = [];
            await LeadGenRemark.find({ lead: lead._id })
                .populate('assignee')
                .sort({ created_at: -1 })
                .cursor()
                .eachAsync(async (l) => {

                    if (l.assignee_remark == "") {
                        l.assignee_remark = l.customer_remark
                    }

                    if (l.assignee) {
                        var assignee = {
                            _id: l.assignee._id,
                            id: l.assignee._id,
                            name: l.assignee.name,
                            email: l.assignee.email,
                            contact_no: l.assignee.contact_no,
                        };
                    } else {
                        var assignee = {
                            _id: "",
                            id: "",
                            name: "",
                            email: "",
                            contact_no: "",
                        };
                    }

                    logs.push({
                        source: l.source,
                        type: l.type,
                        status: l.status,
                        reason: l.reason,
                        customer_remark: l.customer_remark,
                        assignee_remark: l.assignee_remark,
                        assignee: assignee,
                        color_code: l.color_code,
                        created_at: moment(l.created_at).tz(req.headers['tz']).format('lll'),
                        updated_at: moment(l.updated_at).tz(req.headers['tz']).format('lll'),
                    })
                })

            if (lead.assignee) {
                var assignee = {
                    name: lead.assignee.name,
                    email: lead.assignee.email,
                    contact_no: lead.assignee.contact_no,
                    _id: lead.assignee._id,
                    id: lead.assignee._id,
                }
            } else {
                var assignee = {
                    name: "",
                    email: "",
                    contact_no: "",
                    _id: null,
                    id: null,
                }
            }


            // if (lead.follow_up == null) {
            //     var follow_up = {}
            // }
            // else {
            //     follow_up = lead.follow_up
            // }

            var last_active = "";
            if (lead.user) {
                var get_last_active = await User.findById(lead.user).exec();
                if (get_last_active) {
                    last_active = moment(get_last_active.updated_at).tz(req.headers['tz']).format('lll');
                }
            }
            //Abhinav Tyagi

            if (lead.additional_info) {
                if (lead.additional_info.alternate_no) {

                    var alternate_no = lead.additional_info.alternate_no
                } else {
                    var alternate_no = "";
                }

            }
            if (additional_info) {
                var additional_info = {
                    date_file: lead.additional_info.date_file,
                }
            }

            var push = {
                user: lead.user,
                name: lead.name,
                contact_no: lead.contact_no,
                email: lead.email,
                _id: lead._id,
                id: lead.id,
                category: lead.category,
                type: lead.type,
                lead_id: lead.lead_id,
                date: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
                source: lead.source,
                status: lead.status,
                important: lead.important,
                remark: lead.remark,
                contacted: lead.contacted,
                assignee: assignee,
                logs: logs,
                last_active: last_active,
                alternate_no: alternate_no,
                date_file: additional_info,
                created_at: moment(lead.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(lead.updated_at).tz(req.headers['tz']).format('lll'),
            }

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Lead Added ",
                responseData: push
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Lead Not found",
                responseData: {}
            });
        }
    }
});

//Abhinav Custom Service
router.post('/custom/customization/services/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var lb = req.body.labour_cost;
    var pc = req.body.part_cost
    var pg = req.body.package
    var sg = req.body.segment
    // console.log("Labour= " + lb + "Part= " + pc + "Business Id " + business)
    var not_inserted = [];
    // console.log("API Woringg.... Cus")

    var package = ""
    var service = ""
    // console.log("Package " + req.body.package)
    // console.log(req.body.service)
    // console.log("Segment " + req.body.segment)
    var automaker = null;
    var _automaker = "";
    var model = null;
    var _model = "";

    if (req.body._model) {
        var model = await Model.findOne({ value: req.body._model }).exec();
        if (model) {
            var automaker = await Automaker.findById(model.automaker).exec();
            model = model._id;
            _model = model.value;
            automaker = automaker._id;
            _automaker = automaker.maker;
        }
    }

    var tax_info = {}
    var tax_info = await Tax.findOne({ rate: parseFloat(18), type: "GST" }).exec();
    var tax_rate = tax_info.detail;

    var parts = [];
    var labours = [];
    var opening_fitting = [];

    if (parseFloat(req.body.part_cost) > 0) {
        parts_visible = false;
        var service = req.body.service;
        var amount = Math.ceil(req.body.part_cost);
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
                } else {
                    base = base - t
                    part_tax.push({
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        rate: tax_info.rate,
                        amount: parseFloat(tax_on_amount.toFixed(2))
                    });
                }
            }
        }

        tax_detail = {
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            rate: tax_info.rate,
            base: parseFloat(base.toFixed(2)),
            detail: part_tax
        }

        parts.push({
            source: null,
            item: req.body.service,
            // hsn_sac:"",
            part_no: "",
            quantity: 1,
            issued: false,
            rate: parseFloat(req.body.part_cost),
            base: parseFloat(base.toFixed(2)),
            amount: parseFloat(amount),
            tax_amount: _.sumBy(part_tax, x => x.amount),
            amount_is_tax: "inclusive",
            customer_dep: 100,
            insurance_dep: 0,
            discount: 0,
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_info: tax_detail
        })
    }

    if (parseFloat(req.body.labour_cost) > 0) {
        var amount = parseFloat(req.body.labour_cost);
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
                    });
                } else {
                    base = base - t
                    labour_tax.push({
                        tax: tax_info.tax,
                        rate: parseFloat(tax_info.rate.toFixed(2)),
                        amount: parseFloat(tax_on_amount.toFixed(2))
                    });
                }
            }
        }

        labours.push({
            item: req.body.service,
            quantity: 1,
            // hsn_sac: services[i].hsn_sac,
            rate: parseFloat(req.body.labour_cost),
            base: parseFloat(base.toFixed(2)),
            amount: parseFloat(amount),
            discount: 0,
            amount_is_tax: "inclusive",
            customer_dep: 100,
            insurance_dep: 0,
            tax_amount: _.sumBy(labour_tax, x => x.amount),
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_info: {
                tax: tax_info.tax,
                tax_rate: tax_info.rate,
                rate: tax_info.rate,
                base: parseFloat(base.toFixed(2)),
                detail: labour_tax
            }
        })
    }
    var margin_total = parseFloat(req.body.labour_cost) * (40 / 100);
    var mrp = parseFloat(req.body.labour_cost) + margin_total;

    Customization.create({
        business: business,
        imported: true,
        model: model,
        _model: _model,
        automaker: automaker,
        _automaker: _automaker,
        package: req.body.package,
        // Premium,Luxury,Medium,Small, Premium XL,Luxury XL,Sports
        segment: "Premium",
        // service: req.body.service,
        service: req.body.service,
        // description: services[i].description,
        parts: parts,
        part_cost: parseFloat(req.body.part_cost),
        opening_fitting: [],
        of_cost: 0,
        labour: labours,
        labour_cost: parseFloat(req.body.labour_cost),
        cost: parseFloat(req.body.part_cost) + parseFloat(req.body.labour_cost),
        mrp: parseFloat(req.body.part_cost) + Math.ceil(mrp),
        editable: true,
        publish: true,
        approved: false,
        admin_verified: false,
        admin_status: "Custom",
        labour_cost_editable: false,
        part_cost_editable: false,
        of_cost_editable: true,
        amount_is_tax: "inclusive",
        created_at: new Date(),
        updated_at: new Date(),
        // gallery: g,
        tax: "18.0% GST",
        rate: 18,
        tax_info: {
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            rate: tax_info.rate,
            base: parseFloat(base.toFixed(2)),
            detail: labour_tax
        },
    });


    res.status(200).json({
        responseCode: 200,
        responseMessage: "Successfully Created And Wating for Approval",
        responseData: {}
    });
    // event.ServiceApproval("Customization", business, sg, pg, req.body.service, pc, lb, req.headers['tz'])
});

router.post('/custom/collision/services/add', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var lb = req.body.labour_cost;
    var pc = req.body.part_cost
    var pg = req.body.package
    var sg = req.body.segment
    // console.log("Labour= " + lb + "Part= " + pc + "Business Id " + business)
    var not_inserted = [];

    var automaker = null;
    var _automaker = "";
    var model = null;
    var _model = "";

    if (req.body._model) {
        var model = await Model.findOne({ value: req.body._model }).exec();
        if (model) {
            var automaker = await Automaker.findById(model.automaker).exec();

            model = model._id;
            _model = model.value;
            automaker = automaker._id;
            _automaker = automaker.maker;

        }
    }
    var tax_info = {}
    var tax_info = await Tax.findOne({ rate: parseFloat(18), type: "GST" }).exec();
    var tax_rate = tax_info.detail;

    var parts = [];
    var labours = [];
    var opening_fitting = [];

    if (parseFloat(req.body.part_cost) > 0) {
        parts_visible = false;
        var service = req.body.service;
        var amount = Math.ceil(req.body.part_cost);
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
                } else {
                    base = base - t
                    part_tax.push({
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        rate: tax_info.rate,
                        amount: parseFloat(tax_on_amount.toFixed(2))
                    });
                }
            }
        }

        tax_detail = {
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            rate: tax_info.rate,
            base: parseFloat(base.toFixed(2)),
            detail: part_tax
        }

        parts.push({
            source: null,
            item: req.body.service + " Material",
            // hsn_sac: req.body.part_hsn_sac,
            part_no: "",
            quantity: 1,
            issued: false,
            rate: parseFloat(req.body.part_cost),
            base: parseFloat(base.toFixed(2)),
            amount: parseFloat(amount),
            tax_amount: _.sumBy(part_tax, x => x.amount),
            amount_is_tax: "inclusive",
            customer_dep: 100,
            insurance_dep: 0,
            discount: 0,
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_info: tax_detail
        })
    }

    if (parseFloat(req.body.labour_cost) > 0) {
        var amount = parseFloat(req.body.labour_cost);
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
                    });
                } else {
                    base = base - t
                    labour_tax.push({
                        tax: tax_info.tax,
                        rate: parseFloat(tax_info.rate.toFixed(2)),
                        amount: parseFloat(tax_on_amount.toFixed(2))
                    });
                }
            }
        }

        labours.push({
            item: req.body.service,
            quantity: 1,
            // hsn_sac: req.body.hsn_sac,
            rate: parseFloat(req.body.labour_cost),
            base: parseFloat(base.toFixed(2)),
            amount: parseFloat(amount),
            discount: 0,
            amount_is_tax: "inclusive",
            customer_dep: 100,
            insurance_dep: 0,
            tax_amount: _.sumBy(labour_tax, x => x.amount),
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_info: {
                tax: tax_info.tax,
                tax_rate: tax_info.rate,
                rate: tax_info.rate,
                base: parseFloat(base.toFixed(2)),
                detail: labour_tax
            }
        })
    }
    var margin_total = parseFloat(req.body.labour_cost) * (40 / 100);
    var mrp = parseFloat(req.body.labour_cost) + margin_total;

    Collision.create({
        business: business,
        imported: true,
        model: model,
        _model: _model,
        automaker: automaker,
        _automaker: _automaker,
        package: req.body.package,
        segment: req.body.segment,
        service: req.body.service,
        // description: req.body.description,
        parts: parts,
        part_cost: parseFloat(req.body.part_cost),
        opening_fitting: [],
        of_cost: 0,
        labour: labours,
        labour_cost: parseFloat(req.body.labour_cost),
        cost: parseFloat(req.body.part_cost) + parseFloat(req.body.labour_cost),
        mrp: parseFloat(req.body.part_cost) + Math.ceil(mrp),
        editable: true,
        labour_cost_editable: false,
        part_cost_editable: false,
        of_cost_editable: true,
        amount_is_tax: "inclusive",
        publish: true,
        approved: false,
        admin_verified: false,
        admin_status: "Custom",
        created_at: new Date(),
        updated_at: new Date(),


        // gallery: g,
        tax: "18.0% GST",
        rate: 18,
        tax_info: {
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            rate: tax_info.rate,
            base: parseFloat(base.toFixed(2)),
            detail: labour_tax
        },
    });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "New Custom Service Addded Successfully",
        responseData: {}
    });
    // event.ServiceApproval("Collision", business, sg, pg, req.body.service, pc, lb, req.headers['tz'])
});

router.post('/custom/detailing/services/add', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var lb = req.body.labour_cost;
    var pc = req.body.part_cost
    var pg = req.body.package
    var sg = req.body.segment
    // console.log("Labour= " + lb + "Part= " + pc + "Business Id " + business)
    var not_inserted = [];
    var automaker = null;
    var _automaker = "";
    var model = null;
    var _model = "";

    if (req.body._model) {
        var model = await Model.findOne({ value: req.body._model }).exec();
        if (model) {
            var automaker = await Automaker.findById(model.automaker).exec();

            model = model._id;
            _model = model.value;
            automaker = automaker._id;
            _automaker = automaker.maker;

        }
    }
    var tax_info = {}
    var tax_info = await Tax.findOne({ rate: parseFloat(18), type: "GST" }).exec();
    var tax_rate = tax_info.detail;

    var parts = [];
    var labours = [];
    var opening_fitting = [];

    if (parseFloat(req.body.part_cost) > 0) {
        parts_visible = false;
        var service = req.body.service;
        var amount = Math.ceil(req.body.part_cost);
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
                } else {
                    base = base - t
                    part_tax.push({
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        rate: tax_info.rate,
                        amount: parseFloat(tax_on_amount.toFixed(2))
                    });
                }
            }
        }

        tax_detail = {
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            rate: tax_info.rate,
            base: parseFloat(base.toFixed(2)),
            detail: part_tax
        }

        parts.push({
            source: null,
            item: req.body.service + " Material",
            // hsn_sac: req.body.part_hsn_sac,
            part_no: "",
            quantity: 1,
            issued: false,
            rate: parseFloat(req.body.part_cost),
            base: parseFloat(base.toFixed(2)),
            amount: parseFloat(amount),
            tax_amount: _.sumBy(part_tax, x => x.amount),
            amount_is_tax: "inclusive",
            customer_dep: 100,
            insurance_dep: 0,
            discount: 0,
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_info: tax_detail
        })
    }

    if (parseFloat(req.body.labour_cost) > 0) {
        var amount = parseFloat(req.body.labour_cost);
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
                    });
                } else {
                    base = base - t
                    labour_tax.push({
                        tax: tax_info.tax,
                        rate: parseFloat(tax_info.rate.toFixed(2)),
                        amount: parseFloat(tax_on_amount.toFixed(2))
                    });
                }
            }
        }

        labours.push({
            item: req.body.service,
            quantity: 1,
            // hsn_sac: req.body.hsn_sac,
            rate: parseFloat(req.body.labour_cost),
            base: parseFloat(base.toFixed(2)),
            amount: parseFloat(amount),
            discount: 0,
            amount_is_tax: "inclusive",
            customer_dep: 100,
            insurance_dep: 0,
            tax_amount: _.sumBy(labour_tax, x => x.amount),
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_info: {
                tax: tax_info.tax,
                tax_rate: tax_info.rate,
                rate: tax_info.rate,
                base: parseFloat(base.toFixed(2)),
                detail: labour_tax
            }
        })
    }



    var margin_total = parseFloat(req.body.labour_cost) * (40 / 100);
    var mrp = parseFloat(req.body.labour_cost) + margin_total;




    Detailing.create({
        business: business,
        imported: true,
        model: model,
        _model: _model,
        automaker: automaker,
        _automaker: _automaker,
        package: req.body.package,
        segment: req.body.segment,
        service: req.body.service,
        // description: req.body.description,
        parts: parts,
        part_cost: parseFloat(req.body.part_cost),
        opening_fitting: [],
        of_cost: 0,
        labour: labours,
        labour_cost: parseFloat(req.body.labour_cost),
        cost: parseFloat(req.body.part_cost) + parseFloat(req.body.labour_cost),
        mrp: parseFloat(req.body.part_cost) + Math.ceil(mrp),
        editable: true,
        labour_cost_editable: false,
        part_cost_editable: false,
        of_cost_editable: true,
        amount_is_tax: "inclusive",
        created_at: new Date(),
        updated_at: new Date(),
        publish: true,
        approved: false,
        admin_verified: false,
        admin_status: "Custom",

        // gallery: g,
        tax: "18.0% GST",
        rate: 18,
        tax_info: {
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            rate: tax_info.rate,
            base: parseFloat(base.toFixed(2.0)),
            detail: labour_tax
        },

    });

    // console.log(new Date());
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Successfully Created....",
        responseData: {}
    });
    // event.customSer()
    // event.ServiceApproval("Detailing", business, sg, pg, req.body.service, pc, lb, req.headers['tz']);

});

router.post('/custom/servicing/services/add', async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var lb = req.body.labour_cost;
    var pc = req.body.part_cost
    var pg = req.body.package
    var sg = req.body.segment
    // console.log("Labour= " + lb + "Part= " + pc + "Business Id " + business)
    var not_inserted = [];

    var automaker = null;
    var _automaker = "";
    var model = null;
    var _model = "";

    if (req.body._model) {
        var model = await Model.findOne({ value: req.body._model }).exec();
        if (model) {
            var automaker = await Automaker.findById(model.automaker).exec();

            model = model._id;
            _model = model.value;
            automaker = automaker._id;
            _automaker = automaker.maker;

        }
    }


    var tax_info = {}
    var tax_info = await Tax.findOne({ rate: parseFloat(18), type: "GST" }).exec();
    var tax_rate = tax_info.detail;

    var parts = [];
    var labours = [];
    var opening_fitting = [];

    if (parseFloat(req.body.part_cost) > 0) {
        parts_visible = false;
        var service = req.body.service;
        var amount = Math.ceil(req.body.part_cost);
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
                } else {
                    base = base - t
                    part_tax.push({
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        rate: tax_info.rate,
                        amount: parseFloat(tax_on_amount.toFixed(2))
                    });
                }
            }
        }

        tax_detail = {
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            rate: tax_info.rate,
            base: parseFloat(base.toFixed(2)),
            detail: part_tax
        }

        parts.push({
            source: null,
            item: req.body.service,
            // hsn_sac: req.body.hsn_sac,
            part_no: "",
            quantity: 1,
            issued: false,
            rate: parseFloat(req.body.part_cost),
            base: parseFloat(base.toFixed(2)),
            amount: parseFloat(amount),
            tax_amount: _.sumBy(part_tax, x => x.amount),
            amount_is_tax: "inclusive",
            customer_dep: 100,
            insurance_dep: 0,
            discount: 0,
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_info: tax_detail
        })
    }

    if (parseFloat(req.body.labour_cost) > 0) {
        var amount = parseFloat(req.body.labour_cost);
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
                    });
                } else {
                    base = base - t
                    labour_tax.push({
                        tax: tax_info.tax,
                        rate: parseFloat(tax_info.rate.toFixed(2)),
                        amount: parseFloat(tax_on_amount.toFixed(2))
                    });
                }
            }
        }
        labours.push({
            item: req.body.service,
            quantity: 1,
            // hsn_sac: req.body.hsn_sac,
            rate: parseFloat(req.body.labour_cost),
            base: parseFloat(base.toFixed(2)),
            amount: parseFloat(amount),
            discount: 0,
            amount_is_tax: "inclusive",
            customer_dep: 100,
            insurance_dep: 0,
            tax_amount: _.sumBy(labour_tax, x => x.amount),
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_info: {
                tax: tax_info.tax,
                tax_rate: tax_info.rate,
                rate: tax_info.rate,
                base: parseFloat(base.toFixed(2)),
                detail: labour_tax
            }
        })
    }
    var margin_total = parseFloat(req.body.labour_cost) * (40 / 100);
    var mrp = parseFloat(req.body.labour_cost) + margin_total;
    Service.create({
        business: business,
        imported: true,
        model: model,
        type: "services",
        _model: _model,
        automaker: automaker,
        _automaker: _automaker,
        package: req.body.package,
        segment: req.body.segment,
        service: req.body.service,
        // description: req.body.description,
        parts: parts,
        part_cost: parseFloat(req.body.part_cost),
        opening_fitting: [],
        of_cost: 0,
        labour: labours,
        labour_cost: parseFloat(req.body.labour_cost),
        cost: parseFloat(req.body.part_cost) + parseFloat(req.body.labour_cost),
        mrp: parseFloat(req.body.part_cost) + Math.ceil(mrp),
        editable: true,
        labour_cost_editable: false,
        part_cost_editable: false,
        of_cost_editable: true,
        amount_is_tax: "inclusive",
        publish: true,
        approved: false,
        admin_verified: false,
        admin_status: "Custom",
        created_at: new Date(),
        updated_at: new Date(),
        // gallery: g,
        tax: "18.0% GST",
        rate: 18,
        tax_info: {
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            rate: tax_info.rate,
            base: parseFloat(base.toFixed(2)),
            detail: labour_tax
        },
    });
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Successfully Created",
        responseData: {}
    });
    // To send Mails to Super Admin
    // event.ServiceApproval("Service", business, sg, pg, req.body.service, pc, lb, req.headers['tz']);
});



// Vinay testing start
router.get('/leads/booking/test', async (req, res, next) => {
    let pastDate = new Date()
    let exactDate = new Date()
    //exactDate.setDate(exactDate.getDate() - 1)
    pastDate.setDate(pastDate.getDate() - 1)
    let testingDate = new Date(exactDate)
    testingDate.setDate(testingDate.getDate() + 1)

    let todayDate = new Date()
    //todayDate.setDate(todayDate.getDate() + 1)

    // console.log("Two days earlier date...", pastDate, testingDate)

    let query = [{
        $match: {
            status: { $eq: "EstimateRequested" },
            date: { $gt: pastDate, $lte: testingDate }
        }
    },
    { $sort: { date: -1 } },
    {
        $lookup: {
            from: 'User',
            localField: "user",
            foreignField: "_id",
            as: "user"
        }
    },
    {
        $lookup: {
            from: "User",
            localField: "manager",
            foreignField: "_id",
            as: "assignee"
        }
    }
    ]

    bookings = []
    // vinay populate
    let leads = await Booking.aggregate(query)
        .allowDiskUse(true)
        .cursor({ batchSize: 20 })
        .exec()
        .eachAsync(async (booking) => {
            // console.log('User through id....', mongoose.Types.ObjectId(booking.car))
            let remark = {
                customer_remark: "",
                assignee_remark: "",
                resource: "",
                status: "Follow-Up",
                color_code: "#FFFF00",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            let follow_up = {
                date: todayDate,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            let assignee = {
                name: booking.assignee[0].name,
                contact_no: booking.assignee[0].contact_no,
                email: booking.assignee[0].email,
                _id: booking.assignee[0]._id
            }

            //res.json({user: booking.user})
            let lead = {
                user: booking.user[0]._id,
                assignee: assignee,
                important: true,
                business: booking.business,
                name: booking.user[0].name,
                contact_no: booking.user[0].contact_no,
                email: booking.user[0].email,
                remark: remark,
                follow_up: follow_up,
                type: "Booking Estimate Requested",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                converted: true,
                source: 'Website',
                geometry: booking.user[0].geometry,
                contacted: false,
                priority: 1,
                advisor: booking.advisor,
                psf: false,
                category: "Booking",
                remarks: booking.remarks,
                booking: booking._id
            }
            let updatedLead = {}
            let leadExist = await Lead.findOne({ contact_no: booking.user[0].contact_no }).exec()
            if (!leadExist) {
                updatedLead = await Lead.create(lead)
                fun.webNotification("Lead", lead);
            }

            await Booking.findOneAndUpdate({ _id: booking._id }, { lead: updatedLead._id })
            bookings.push(updatedLead)
        })

    res.json({
        leads: bookings
    })
})

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

router.get('/order/list', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];

})

let createParts = (vendorParts, allParts) => {
    // console.log("All vendors parts..", vendorParts)
    let partsArr = []
    allParts.forEach(ap => {
        let partsObj = {
            item: ap.item,
            source: ap.source,
            hsn_sac: ap.hsn_sac,
            part_no: ap.part_no,
            quantity: ap.quantity,
            rate: "",
            base: ap.base,
            amount: "",
            tax_amount: ap.tax_amount,
            amount_is_tax: ap.amount_is_tax,
            discount: ap.discount,
            customer_dep: ap.customer_dep,
            insurance_dep: ap.insurance_dep,
            tax_rate: ap.tax_rate,
            tax: ap.tax,
            issued: ap.issued,
            tax_info: ap.tax_info,
            partsSelected: false,
            partsStatus: "not requested"
        }
        vendorParts.forEach(vp => {
            if (vp.part == ap.item) {
                partsObj = {
                    item: ap.item,
                    source: ap.source,
                    hsn_sac: ap.hsn_sac,
                    part_no: ap.part_no,
                    quantity: ap.quantity,
                    rate: "",
                    base: ap.base,
                    amount: "",
                    tax_amount: ap.tax_amount,
                    amount_is_tax: ap.amount_is_tax,
                    discount: ap.discount,
                    customer_dep: ap.customer_dep,
                    insurance_dep: ap.insurance_dep,
                    tax_rate: ap.tax_rate,
                    tax: ap.tax,
                    issued: ap.issued,
                    tax_info: ap.tax_info,
                    partsSelected: false,
                    partsStatus: "requested"
                }
            }
        })
        partsArr.push(partsObj)
    })
    return partsArr
}

router.put('/order/status', async (req, res, next) => {
    let vendors = req.body.vendors
    let status = req.body.status
    let query = { _id: { $in: vendors } }
    await VendorOrders.findOneAndUpdate(query)
        .cursor()
        .eachAsync(async o => {
            if (status == 'Received' && o.status == 'Requested') {
                await res.json({
                    message: "Please Confirm the order first"
                })
            } else {
                o.status = status
                o.save()
            }

        })

    res.json({ message: "Order " + status })
})

//Abhinav Tyagi
router.get('/package-renew/get', async function (req, res, next) {

    var dates = []
    var date = new Date()
    dates.push({
        today: date.getDate(),
        month: date.getMonth(),
        day: date.getFullYear()
    })
    var bar = new Date();
    if (bar.getDay >= 25) {

        bar.setDate(bar.getDate() + 7);
        bar.setMonth(bar.getMonth() + 1);
        // console.log("Date of expire by today Month Changed " + new Date(bar))

    } else {

        bar = bar.setDate(bar.getDate() + 7);
        // console.log("Date of expire by today " + bar.getFullYear)
        // console.log("Date Function:" + new Date(bar))

    }

    // return res.json(dates)

    var filters = [];

    var business = "5bfec47ef651033d1c99fbca";
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
    specification['$unwind'] = {
        path: "$car",
        preserveNullAndEmptyArrays: true
    };


    // var bar = new Date();

    // bar.setDate(bar.getDate() + 7);

    // console.log("Date of " + bar)

    var specification = {};
    specification['$match'] = {
        business: mongoose.Types.ObjectId(business),
        "expired_at": { $gte: new Date(), $lt: new Date(bar) },
    }
    filters.push(specification);

    // console.log("New Date", new Date())
    // console.log("Exp date", new Date(bar))

    // var bar1 = new Date(bar)
    // console.log("Month of Exp date" + bar.getMonth())
    var user_pack1 = [];
    await UserPackage.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (user_pack) {

            user_pack1.push({
                exdate: user_pack.expired_at
            })
            // console.log(user_pack.length)
            // if(user_pack.expired_at.getDate==new Date().getDate)
            var dd = user_pack.expired_at.getDate();
            var mm = user_pack.expired_at.getMonth();
            var yyyy = user_pack.expired_at.getFullYear();

            var exp_date = dd + "/" + mm;
            var dd1 = new Date(bar).getDate();
            var mm1 = new Date(bar).getMonth();
            // var yyyy1 =  bar.getFullYear();
            var date1 = dd1 + "/" + mm1;

            // console.log(exp_date + "=" + date1)

            if (date1 === exp_date) {

                // console.log("Date Matched")


                var contact_no = user_pack.user.contact_no;
                // console.log(contact_no)
                // contact_no = contact_no.substring(3)
                var getUser = await User.findOne({ contact_no: contact_no }).exec();



                var user = null;
                var name = user_pack.user.name;
                var email = user_pack.user.email;
                var businessId = user_pack.business._id;
                // var source=req.query.leadtype;
                // console.log("Business" + businessId)
                var source = "Package Renewal";

                if (getUser) {
                    user = getUser._id;
                    name = getUser.name;
                    email = getUser.email;
                    contact = getUser.contact_no;
                }

                var checkLead = await Lead.findOne({ contact_no: contact_no, business: businessId, "remark.status": { $in: ["Open", "Follow-Up",] } }).sort({ updated_at: -1 }).exec();
                var date = null;
                var status = await LeadStatus.findOne({ status: "Open" }).exec();
                // console.logtus...." + checkLead.remark.status)
                if (checkLead) {
                    if (checkLead.follow_up) {
                        var date = checkLead.follow_up.date
                        var time = checkLead.follow_up.time
                        // console.log("Follow up Date  " + date)
                    } else {
                        date = null
                    }
                    Lead.findOneAndUpdate({ _id: checkLead._id }, {
                        $set: {
                            type: "Package",
                            follow_up: {
                                date: date,
                                time: time,
                                created_at: new Date(),
                                updated_at: new Date(),
                            },
                            remark: {
                                status: checkLead.remark.status,
                                resource: "",
                                customer_remark: "",
                                assignee_remark: "",
                                color_code: status.color_code,
                                created_at: new Date(),
                                updated_at: new Date()
                            },
                            source: "Package Renewal",
                            status: checkLead.status,
                            updated_at: new Date(),
                            // business:businessId
                        }
                    }, { new: false }, async function (err, doc) {

                        LeadRemark.create({
                            lead: checkLead._id,
                            type: "User Package",
                            source: "Package Renewal",
                            resource: "",
                            status: checkLead.remark.status,
                            customer_remark: "",
                            assignee_remark: "",
                            assignee: checkLead.assignee,
                            color_code: status.color_code,
                            created_at: new Date(),
                            updated_at: new Date()
                        }).then(function (newRemark) {
                            Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: false }, async function (err, doc) { })
                        });


                        // event.assistance(checkLead, req.headers['tz'])

                        // var json = ({
                        //     responseCode: 200,
                        //     responseMessage: "Pre: "+checkLead._id,
                        //     responseData: {}
                        // });

                        // res.status(200).json("RECEIVED")

                    });


                } else {
                    // console.log("Create new lead", contact_no)

                    var data = {}
                    var manager = businessId;

                    var status = await LeadStatus.findOne({ status: "Open" }).exec();
                    var managers = [];
                    await Management.find({ business: businessId, role: "CRE" })
                        .cursor().eachAsync(async (a) => {
                            // var d = await Lead.find({ business: businessId, assignee: a.user }).count().exec();
                            var open = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                            var follow_up = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                            var d = open + follow_up;
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
                        user: user,
                        business: businessId,
                        name: name,
                        contact_no: contact_no,
                        email: email,
                        assignee: manager,
                        contacted: false,
                        priority: 3,
                        follow_up: {

                        },
                        type: req.query.leadtype,
                        geometry: [0, 0],
                        source: source,
                        remark: {
                            status: status.status,
                            customer_remark: "",
                            assignee_remark: "",
                            assignee: manager,
                            resource: req.query.resource_url,
                            color_code: status.color_code,
                            created_at: new Date(),
                            updated_at: new Date(),
                        },

                        created_at: new Date(),
                        updated_at: new Date(),
                    }

                    Lead.create(data).then(async function (lead) {
                        var count = await Lead.find({ _id: { $lt: lead._id }, business: businessId }).count();
                        var lead_id = count + 10000;

                        Lead.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) { })
                        var status = await LeadStatus.findOne({ status: "Open" }).exec();
                        fun.webNotification("Lead", lead);

                        await whatsAppEvent.leadGenerate(lead._id, business);
                        event.leadCre(lead._id, business);
                        await whatsAppEvent.leadCre(lead._id, business);

                    });
                }
                data = {
                    customer_name: name,
                    package_name: user_pack.name,
                    mobile: contact_no,
                    email: email,
                    expired_at: user_pack.expired_at,
                };


                event.packageRenewSMS(data)
            } else {
                // console.log("Date Note Matched")
            }

        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseInfo: {
            // totalResult: totalResult.length
        },
        responseData: user_pack1,

    });
});

//Automative Renw
setInterval(() => {
    var tm = new Date();
    let hr = tm.getHours();
    let mi = tm.getMinutes();
    // let sec = tm.getSeconds();
    // console.log(hr + "-" + mi);
    if (hr == 09 && mi == 01) {

        var dates = []
        var date = new Date()
        dates.push({
            today: date.getDate(),
            month: date.getMonth(),
            day: date.getFullYear()
        })

        // console.log("Today Date Array" + dates)

        var bar = new Date();
        if (bar.getDay >= 25) {

            bar.setDate(bar.getDate() + 7);
            bar.setMonth(bar.getMonth() + 1);
            // console.log("Date of expire by today Month Changed " + new Date(bar))

        } else {

            bar = bar.setDate(bar.getDate() + 7);
            // console.log("Date of expire by today " + bar.getFullYear)
            // console.log("Date Function:" + new Date(bar))

        }

        // return res.json(dates)

        var filters = [];

        var business = "5bfec47ef651033d1c99fbca";
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
        specification['$unwind'] = {
            path: "$car",
            preserveNullAndEmptyArrays: true
        };


        // var bar = new Date();

        // bar.setDate(bar.getDate() + 7);

        // console.log("Date of " + bar)

        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            "expired_at": { $gte: new Date(), $lt: new Date(bar) },
        }
        filters.push(specification);

        // console.log("New Date", new Date())
        // console.log("Exp date", new Date(bar))

        // var bar1 = new Date(bar)
        // console.log("Month of Exp date" + bar.getMonth())
        var user_pack1 = [];
        UserPackage.aggregate(filters)
            .allowDiskUse(true)
            .cursor({ batchSize: 10 })
            .exec()
            .eachAsync(async function (user_pack) {

                user_pack1.push({
                    exdate: user_pack.expired_at
                })
                // console.log(user_pack.length)
                // if(user_pack.expired_at.getDate==new Date().getDate)
                var dd = user_pack.expired_at.getDate();
                var mm = user_pack.expired_at.getMonth();
                var yyyy = user_pack.expired_at.getFullYear();

                var exp_date = dd + "/" + mm;
                var dd1 = new Date(bar).getDate();
                var mm1 = new Date(bar).getMonth();
                // var yyyy1 =  bar.getFullYear();
                var date1 = dd1 + "/" + mm1;

                // console.log(exp_date + "=" + date1)

                if (date1 === exp_date) {

                    // console.log("Date Matched")


                    var contact_no = user_pack.user.contact_no;
                    // console.log(contact_no)
                    // contact_no = contact_no.substring(3)
                    var getUser = await User.findOne({ contact_no: contact_no }).exec();



                    var user = null;
                    var name = user_pack.user.name;
                    var email = user_pack.user.email;
                    var businessId = user_pack.business._id;
                    // var source=req.query.leadtype;
                    // console.log("Business" + businessId)
                    var source = "Package Renewal";

                    if (getUser) {
                        user = getUser._id;
                        name = getUser.name;
                        email = getUser.email;
                        contact = getUser.contact_no;
                    }

                    var checkLead = await Lead.findOne({ contact_no: contact_no, business: businessId, "remark.status": { $in: ["Open", "Follow-Up",] } }).sort({ updated_at: -1 }).exec();
                    var date = null;
                    var status = await LeadStatus.findOne({ status: "Open" }).exec();
                    // console.log("Status...." + checkLead.remark.status)
                    if (checkLead) {
                        if (checkLead.follow_up) {
                            var date = checkLead.follow_up.date
                            var time = checkLead.follow_up.time
                            // console.log("Follow up Date  " + date)
                        } else {
                            date = null
                        }
                        Lead.findOneAndUpdate({ _id: checkLead._id }, {
                            $set: {
                                type: "Package",
                                follow_up: {
                                    date: date,
                                    time: time,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                },
                                remark: {
                                    status: checkLead.remark.status,
                                    resource: "",
                                    customer_remark: "",
                                    assignee_remark: "",
                                    color_code: status.color_code,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                },
                                source: "Package Renewal",
                                status: checkLead.status,
                                updated_at: new Date(),
                                // business:businessId
                            }
                        }, { new: false }, async function (err, doc) {

                            LeadRemark.create({
                                lead: checkLead._id,
                                type: "User Package",
                                source: "Package Renewal",
                                resource: "",
                                status: checkLead.remark.status,
                                customer_remark: "",
                                assignee_remark: "",
                                assignee: checkLead.assignee,
                                color_code: status.color_code,
                                created_at: new Date(),
                                updated_at: new Date()
                            }).then(function (newRemark) {
                                Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: false }, async function (err, doc) { })
                            });


                            // event.assistance(checkLead, req.headers['tz'])

                            // var json = ({
                            //     responseCode: 200,
                            //     responseMessage: "Pre: "+checkLead._id,
                            //     responseData: {}
                            // });

                            // res.status(200).json("RECEIVED")

                        });

                    } else {
                        // console.log("Create new lead")

                        var data = {}
                        var manager = businessId;

                        var status = await LeadStatus.findOne({ status: "Open" }).exec();
                        var managers = [];
                        await Management.find({ business: businessId, role: "CRE" })
                            .cursor().eachAsync(async (a) => {
                                // var d = await Lead.find({ business: businessId, assignee: a.user }).count().exec();
                                var open = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
                                var follow_up = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
                                var d = open + follow_up;
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
                            user: user,
                            business: businessId,
                            name: name,
                            contact_no: contact_no,
                            email: email,
                            assignee: manager,
                            contacted: false,
                            priority: 3,
                            follow_up: {

                            },
                            type: req.query.leadtype,
                            geometry: [0, 0],
                            source: source,
                            remark: {
                                status: status.status,
                                customer_remark: "",
                                assignee_remark: "",
                                assignee: manager,
                                resource: req.query.resource_url,
                                color_code: status.color_code,
                                created_at: new Date(),
                                updated_at: new Date(),
                            },

                            created_at: new Date(),
                            updated_at: new Date(),
                        }

                        Lead.create(data).then(async function (lead) {
                            var count = await Lead.find({ _id: { $lt: lead._id }, business: businessId }).count();
                            var lead_id = count + 10000;

                            Lead.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) { })
                            var status = await LeadStatus.findOne({ status: "Open" }).exec();
                            fun.webNotification("Lead", lead);

                            await whatsAppEvent.leadGenerate(lead._id, business);
                            event.leadCre(lead._id, business);
                            await whatsAppEvent.leadCre(lead._id, business);

                        });
                    }
                    data = {
                        customer_name: name,
                        package_name: user_pack.name,
                        mobile: contact_no,
                        email: email,
                        expired_at: user_pack.expired_at,
                    };


                    event.packageRenewSMS(data)
                } else {
                    // console.log("Date Not Matched")
                }
            });

        // res.status(200).json({
        //     responseCode: 200,
        //     responseMessage: "",
        //     responseInfo: {
        //         // totalResult: totalResult.length
        //     },
        //     responseData: user_pack1,

        // });
    }
}, 40000);

//Abhinav//
router.post('/suit-plan/create', async function (req, res, next) {
    var short_name = "APS";
    var name = "Autroid Parts System";
    var plan = "Free";
    // var chat = true;       //AWS
    // var thirdParty = true; //AWS
    var chat = true; //AWS
    var def = [{
        "tag": "business-overview",
        "module": "Management",
        "enable": true,
        "action": "Business Overview"
    },
    //{
    //  "tag": "analytic",
    // "module": "Management",
    //  "enable": true,
    //   "action": "Reports"
    //},
    {
        "tag": "leads",
        "module": "CRM",
        "enable": false,
        "action": "Leads",
        "category": [
            "Products",
            "Booking",
            "Insurance"
        ],
        "activityTab": [{
            "tab": "Open Leads",
            "activity": "Open",
            "enable": false
        },
        {
            "tab": "Follow-up Leads",
            "activity": "Follow-Up",
            "enable": false
        },
        {
            "tab": "Closed & Lost",
            "activity": "Closed",
            "enable": false
        }
        ]
    },
    {
        "tag": "stock",
        "module": "Master",
        "enable": true,
        "action": "Stock"
    },
    // {
    //     "tag": "labour",
    //     "module": "Master",
    //     "enable": true,
    //     "action": "Services"
    // },
    //{
    //   "tag": "suppliers",
    //   "module": "Master",
    //   "enable": true,
    //    "action": "Suppliers"
    //  },
    //APS
    {
        "tag": "orders",
        "module": "Master",
        "enable": true,
        "action": "Sales Order"
    },
    {
        "tag": "orders",
        "module": "Master",
        "enable": true,
        "action": "Purchased Order"
    },
    {
        "tag": "suppliers",
        "module": "Master",
        "enable": true,
        "action": "Businesses"
    },

    //APS END
    {
        "tag": "expense",
        "module": "Accounts",
        "enable": true,
        "action": "Expenses"
    },
    {
        "tag": "invoices",
        "module": "Accounts",
        "enable": true,
        "action": "Sales"
    }
    ]
    var main = [
        // {
        //     "tag": "booking",
        //     "module": "WMS",
        //     "enable": true,
        //     "action": "Bookings"
        // },
        // {
        //     "tag": "jobs",
        //     "module": "WMS",
        //     "enable": true,
        //     "action": "Jobs"
        // },
        // {
        //     "tag": "orders",
        //     "module": "WMS",
        //     "enable": false,
        //     "action": "Sales Orders"
        // },
        // {
        //     "tag": "leads",
        //     "module": "CRM",
        //     "enable": false,
        //     "action": "leads"
        // },
        // {
        //     "tag": "leads generation",
        //     "module": "CRM",
        //     "enable": false,
        //     "action": "leads generation"
        // }
    ]
    var price = 0
    var limits = {
        "stock": 10000,
        // "serviceListingApp": 50, //Only For AWS
        // "stock_publish": 0, //Only For AWS
        "invoices": 50,
        "Online_orders": 25,
        "users": 1
    }
    var category = "Parts"
    var validity = 365
    var thirdParty = {
        quickbooks: true,
        justdial: true,
        knowlarity: true,
        whatsApp_Official: true,
        custom_API_integrations: true,
    }
    var procurement = {
        partsProcurement: true,
        chatwithBusinesses: true,
        orderManagement: true,
        B2BPayments: true,
        autoInventoryUpdate: true,
    }
    var supportTraining = {
        technicalAssistance: true,
        Support: "On-site",
        managementTrainings: true,
        processImplementation: true,
        carEagerPartnerEligibility: true,
    }
    var accountings = {
        accounting: false,
        reports: false,
        integratedWallet: false,
        gstReturns: false
    }
    // var marketing = {
    //     serviceListingsonAutroidApp: 20,
    //     exclusiveServicesonAutroidApp: 10,
    //     toppositionintheApp: true,
    //     packagesCoupons: true,
    //     promotionalSMS: 5000,
    //     certificate: true,
    //     branding: true
    // }
    var marketing = { //ONLY FOR APS
        toppositionintheWorkoshop: false,
        toppositionintheApp: false,
        promotionalSMS: 5000,
        certificate: false,
        branding: false
    }
    var customer_relationship = { //Only for APS
        clicktochat_WhatsApp: true,
        clicktocall: false,
        whatsApp_Official: false,
        chatwithWorkshops: true,
        chatwithCarOwners: false,
        b2b_LeadGeneration: true,
        b2c_LeadGeneration: false,
        automaticInventoryUpdate: false,
        b2b_payments: false,
    }

    var plan_suit = {
        short_name: short_name,
        name: name,
        plan: plan,
        chat: chat,
        default: def,
        main: main,
        price: price,
        limits: limits,
        category: category,
        validity: validity,
        // thirdParty: thirdParty,
        // procurement: procurement,
        // supportTraining: supportTraining,
        accountings: accountings,
        marketing: marketing,
        customerRelationship: customer_relationship
    }
    SuitePlan.create(plan_suit).then(async function (claim) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Plan Created",
            responseData: plan_suit,

        });
    });

});
router.post('/suit-plan/create/others', async function (req, res, next) {
    var short_name = "Others";
    var name = "Others System";
    var plan = "Free";
    var chat = true; //AWS
    var def = [{
        "tag": "profile",
        "module": "Profile",
        "enable": true,
        "action": "Business"
    }]
    var price = 0
    var limits = {
        "invoices": 5,
        "users": 1
    }
    var category = "Others"
    var validity = 365

    var plan_suit = {
        short_name: short_name,
        name: name,
        plan: plan,
        default: def,
        price: price,
        limits: limits,
        category: category,
        validity: validity,
    }
    SuitePlan.create(plan_suit).then(async function (claim) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Plan Created",
            responseData: plan_suit,

        });
    });

});

router.put('/business-plan/update', xAccessToken.token, async function (req, res, next) {
    var business = await User.findById(req.body.user).exec();
    // console.log("Business Id " + req.body.user + "  ==--== " + req.body.plans)
    // console.log(business)
    if (business) {
        var req_plans = req.body.plans;
        // console.log("Req Plan ", req_plans)
        var exists = await SuitePlan.find({ _id: req_plans }).count().exec();
        // console.log(exists, "   Comapre  ", req_plans.length)
        // if (exists == req_plans.length) {
        if (exists) {
            var plans = await BusinessPlan.find({ business: req.body.user }).count().exec();
            // console.log("Count = " + plans)
            if (plans != 0) {
                await SuitePlan.find({ _id: req_plans })
                    .cursor().eachAsync(async (plan) => {
                        if (plan) {
                            // console.log(plan.validity + " 5da6dd1f12203c04165caf0a Plan " + new Date() + ", found - " + plan.plan)
                            var expired_at = new Date();
                            expired_at.setDate(expired_at.getDate() + plan.validity);
                            // console.log(expired_at)
                            // console.log("Inside Update= " + req.body.user)
                            BusinessPlan.findOneAndUpdate({ business: req.body.user }, {
                                $set: {
                                    // suite: plan._id,
                                    suite: req_plans,
                                    plan: plan.plan,
                                    name: plan.name,
                                    short_name: plan.short_name,
                                    price: plan.price,
                                    default: plan.default,
                                    main: plan.main,
                                    limits: plan.limits,
                                    category: plan.category,
                                    validity: plan.validity,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    expired_at: expired_at,
                                    business: business._id
                                }
                            }).exec();
                            // console.log("Updated==")
                        }
                    });

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Suite plans has been Updated.",
                    responseData: {}
                });
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "No Plans Exists.",
                    responseData: {}
                });
            }
        } else {
            res.status(422).json({
                responseCode: 422,
                responseMessage: "Please check plan before save.",
                responseData: {}
            });
        }
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Business not found",
            responseData: {}
        });
    }
});

//Abhinav
router.post('/gallery/update/xpress', function (req, res, next) {
    // var token = req.headers['x-access-token'];
    // var secret = config.secret;
    // var decoded = jwt.verify(token, secret);

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
                } else {
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

                business: req.body.id,
                category: req.body.type,
                file: req.files[0].key,
                created_at: new Date(),
                updated_at: new Date()
            };
            // console.log(req.files[0].key, " ----- ", req.body.id)

            var serviceGallery = new ServiceGallery(data);
            serviceGallery.save();

            res.status(200).json({
                responseCode: 200,
                responseMessage: "File has been uploaded",
                responseData: {
                    item: serviceGallery,
                }
            })
        }
    });
});

router.get('/send/email', async function (req, res, next) {

    var user = await User.findOne({ email: 'abhinav@autroid.com' }).exec();
    event.autroidSignUpMail(user)
    // event.autroidSignUpSMS(user)
    event.autroidOnboardings(user)

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Sent",
        responseData: user
    });
});

// New business overview api start [Kaushlesh Pandey]
router.get('/jobVSbookings/counts/get1', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
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
    } else {
        req.headers['x-access-token var token = '];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];
        var analyticsBooking = [];
        var bookingAll = [];
        var jobsAll = [];
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        // var from = new Date(req.query.from);
        // var to = new Date(req.query.to);

        // var startDate = moment(req.query.from);
        // var endDate = moment(req.query.to);
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        // console.log("Duration = " + duration)
        // console.log("Query = " + req.query.query + "\n from = " + from + "\n to = " + to + "\n startDate = " + startDate + "\n endDate = " + endDate)
        var range = { $gte: from, $lte: to };
        var countFree = 0
        var countPaid = 0
        // status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"] },
        await Booking.find({ is_services: true, business: business, status: { $in: ["Confirmed", "Pending", "EstimateRequested", "JobOpen", "JobInititated", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed", "Cancelled"] }, updated_at: range })
            .cursor().eachAsync(async (bookings) => {
                var totalBookings = 0
                var totalJobs = 0
                var month = moment(bookings.updated_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(bookings.updated_at).tz(req.headers['tz']).format('MMM DD');
                    // console.log("Month <31 = " + month)
                }
                var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
                var booking = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
                // if (bookings.status == 'Confirmed' || 'Pending' || 'EstimateRequested' || 'JobInititated' || 'Cancelled') {
                if (booking.indexOf(bookings.status) != -1) {
                    // console.log(month + " = Inside Bookings = " + bookings.status)
                    bookingAll.push(1)
                    totalBookings = totalBookings + 1
                    analyticsBooking.push({
                        category: "booking",
                        sort: moment(bookings.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalBookings: totalBookings
                    });

                } else {
                    // console.log(month + " = Inside Bookings = " + bookings.status)
                    totalJobs = totalJobs + 1
                    jobsAll.push(1)
                    analytics.push({
                        category: "Jobs",
                        sort: moment(bookings.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                        month: month,
                        totalJobs: totalJobs
                    });
                }
            });
        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var jobsData = _(analytics).groupBy('month').map((objs, key) => ({
            // bookings: parseInt(_.sumBy(objs, 'totalBookings')),
            jobs: parseInt(_.sumBy(objs, 'totalJobs')),
            month: key,
            total: objs.length,
            // source: _(objs).groupBy(x => x.category).map((objs1, key1) => ({
            //     category: key1,
            //     total: objs1.length,
            // })),
        })).value();

        analyticsBooking = _.orderBy(analyticsBooking, ['sort'], ['asc'])
        var bookingsData = _(analyticsBooking).groupBy('month').map((objs, key) => ({
            bookings: parseInt(_.sumBy(objs, 'totalBookings')),

            month: key,
            total: objs.length,
            // source: _(objs).groupBy(x => x.category).map((objs1, key1) => ({
            //     category: key1,
            //     total: objs1.length,
            // })),
        })).value();
        // console.logtal = " + data.labour_cost)

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                Totalbookings: bookingAll.length,
                Totaljobs: jobsAll.length
                // objs: parseInt(_.sumBy(data.totalFree)),
            },
            responseData: {
                bookings: bookingsData,
                jobs: jobsData
            }
        });
    }
});

router.get('/expences/cosg/get', /* xAccessToken.token,*/ async function (req, res, next) {
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business']

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];


        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0





        await Purchase.find({ updated_at: { $gte: from, $lte: to }, business: business })
            .cursor().eachAsync(async (expence) => {
                var expenceTotal = expence.total;
                // console.log(" expenceTotal ", expenceTotal)
                count = count + 1
                totalExpenceCost = totalExpenceCost + expence.total;
                var month = moment(expence.updated_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(expence.updated_at).tz(req.headers['tz']).format('MMM DD');

                }
                analytics.push({
                    expenceTotal: expenceTotal,
                    sort: moment(expence.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            })


        analytics = _.orderBy(analytics, ['sort'], ['asc'])

        var expenceTotalData = _(analytics).groupBy('month').map((objs, key) => ({
            expenceTotal: parseInt(_.sumBy(objs, 'expenceTotal')),
            month: key,
            total: objs.length,
        })).value();



        res.status(200).json({
            responseCode: 200,
            responseMessage: {

                totalExpenceCost: parseFloat(totalExpenceCost).toFixed(0)
            },
            responseData: {

                expenceProfit: expenceTotalData,
            }
        });




    }

});

router.get('/revenue-fromCurrent/get/test', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
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
    } else {
        var token = req.headers['x-access-token'];
        var business = req.headers['business']
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var leftDaysInMonth = date.getDate();
        // console.log("leftDaysInMonth ==> ", leftDaysInMonth)
        var from = new Date()
        var to = new Date()
        var lastFrom = new Date()
        var lastTo = new Date()

        var analytics = [];
        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        } else {
            var query = leftDaysInMonth;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
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
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalRevenue = 0
        count = 0
        // console.log("From = " + from + " ,To = " + to + "\n lastFrom" + lastFrom + " ,LastTo= " + LastTo)
        await Invoice.find({ business: business, status: "Active", updated_at: { $gt: from, $lt: to } })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                totalRevenue = totalRevenue + labour_cost + part_cost + of_cost
                var month = moment(invoice.created_at).tz(req.headers['tz']).format('MMMM YYYY');
                // console.log("Month = " + month)
                if (duration <= 31) {
                    month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                    //  // console.log("Month <31 = " + month)
                }

                analytics.push({
                    total: labour_cost + part_cost + of_cost,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });

        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            revenu: parseInt(_.sumBy(objs, 'total')),
            month: key,
            total: objs.length,
        })).value();

        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                // query: { $gt: from, $lt:to } 
                toalRevenue: parseFloat(totalRevenue).toFixed(0)
            },
            responseData: data
        });
    }
});

router.get('/revenue-fromCurrent/get/abhiTesting', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
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
    } else {
        var token = req.headers['x-access-token'];
        var business = req.headers['business']
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var leftDaysInMonth = date.getDate();
        // console.log("leftDaysInMonth ==> ", leftDaysInMonth)
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
            // var from = new Date(date.getFullYear(), date.getMonth() , 1);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            // var from = new Date(date.getFullYear(), date.getMonth() , 1);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        } else {
            var query = leftDaysInMonth;
            // var from =new Date(date.getFullYear(), date.getMonth() , 1);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        var fromThisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        var toThisMonth = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        //past MOnths Date Ranges as per the current date form 1st
        // var _1st_To = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
        // var _1st_From = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        // var _2_To = new Date(date.getFullYear(), date.getMonth() - 2, date.getDate());
        // var _2_From = new Date(date.getFullYear(), date.getMonth() - 2, 1);
        // var _3_To = new Date(date.getFullYear(), date.getMonth() - 3, date.getDate());
        // var _3_From = new Date(date.getFullYear(), date.getMonth() - 3, 1);
        // var _4_To = new Date(date.getFullYear(), date.getMonth() - 4, date.getDate());
        // var _4_From = new Date(date.getFullYear(), date.getMonth() - 4, 1);

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalRevenue = 0
        count = 0
        // console.log("From = " + from + " ,To = " + to)
        //Current Month 
        await Invoice.find({ business: business, status: "Active", created_at: { $gte: from, $lt: to } })
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
                if (duration <= 31) {
                    month = moment(invoice.created_at).tz(req.headers['tz']).format('MMM DD');
                    //  // console.log("Month <31 = " + month)
                }

                analytics.push({
                    total: labour_cost + part_cost + of_cost,
                    sort: moment(invoice.created_at).tz(req.headers['tz']).format('YYYY-MM-DD'),
                    month: month
                });
            });

        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('month').map((objs, key) => ({
            revenu: parseInt(_.sumBy(objs, 'total')),
            month: key,
            total: objs.length,
        })).value();
        await Invoice.find({ business: business, status: "Active", created_at: { $gte: fromThisMonth, $lt: toThisMonth } })
            .cursor().eachAsync(async (invoice) => {
                var pick_up_charges = invoice.payment.pick_up_charges;
                var policy_clause = invoice.payment.policy_clause;
                var salvage = invoice.payment.salvage;

                var labour_cost = _.sumBy(invoice.services, x => x.labour_cost);
                var part_cost = _.sumBy(invoice.services, x => x.part_cost);
                var of_cost = _.sumBy(invoice.services, x => x.of_cost) + pick_up_charges + policy_clause + salvage;
                totalRevenue = totalRevenue + labour_cost + part_cost + of_cost

            });
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                // query: { $gt: from, $lt:to } 
                toalRevenue: parseFloat(totalRevenue).toFixed(0)
            },
            responseData: data
        });
    }
});

router.get('/customer-overview/executive/leads/1st/test', /* xAccessToken.token,*/ async function (req, res, next) {
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business']

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];

        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }

        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0

        // console.log("From = " + from + " \n To= " + to)
        // var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        // var bookingStatus = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
        // var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]

        await Lead.find({ updated_at: { $gte: from, $lte: to }, business: business }).populate('assignee')
            .cursor().eachAsync(async (lead) => {
                // if(lead.source)
                // 
                if (lead.converted == true) {

                    if (lead.assignee) {
                        analytics.push({
                            // expenceTotal: expenceTotal,
                            converted: true,
                            assignee: lead.assignee.name,
                            sort: moment(lead.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),

                        });
                    }
                } else {
                    if (lead.assignee) {
                        analytics.push({
                            // expenceTotal: expenceTotal,
                            converted: false,
                            assignee: lead.assignee.name,
                            sort: moment(lead.updated_at).tz(req.headers['tz']).format('YYYY-MM-DD'),

                        });
                    }
                }
            })

        // return res.json(analytics)
        analytics = _.orderBy(analytics, ['sort'], ['asc'])
        var data = _(analytics).groupBy('assignee').map((objs, key) => ({
            total: objs.length,
            assignee: key,
            // source: (objs, 'source'),
            value: objs

        })).value();
        // console.log("Data Length = " + data.length)
        data.sort(function (a, b) {
            return b.total - a.total;
        });
        // return res.json(data)
        var leads = []
        for (var i = 0; i < data.length; i++) {
            var dt = data[i].value
            leads.push({
                data: _(dt).groupBy('converted').map((objs, key) => ({
                    total: objs.length,
                    converted: key,
                    // value: objs
                })).value(),
                assignee: data[i].assignee
            })
        }
        // return res.json(mapd)
        res.status(200).json({
            responseCode: 200,
            responseMessage: {},
            responseData: leads

        });
    }
});

router.get('/customer-overview/executive/leads/2nd/test', /* xAccessToken.token,*/ async function (req, res, next) {
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
    } else {
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var date = new Date();
        var business = req.headers['business']

        var from = new Date()
        var to = new Date()
        var analytics = [];
        var bills = [];
        var analyticsRevenue = [];

        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var count = 0
        var totalExpenceCost = 0

        // console.log("From = " + from + " \n To= " + to)
        // var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        // var bookingStatus = ["Confirmed", "Pending", "EstimateRequested", "JobInititated", "Cancelled"]
        var jobsStatus = ["JobOpen", "In-Process", "CompleteWork", "QC", "StoreApproval", "Ready", "Completed", "Closed"]
        var leadConversion = []
        await Management.find({ business: business, role: "CRE" }).populate('user')
            .cursor().eachAsync(async (assignee) => {
                // console.log("Id = " + assignee._id)
                var convertedLeads = await Lead.find({ assignee: assignee.user._id, created_at: { $gte: from, $lte: to }, business: business, converted: true }).count().exec();
                // console.log("convertedLeads = " + convertedLeads)
                analytics.push({
                    converted: convertedLeads,
                    assignee: assignee.user.name
                })
                var nonConvertedLeads = await Lead.find({ assignee: assignee.user._id, created_at: { $gte: from, $lte: to }, business: business, converted: false }).count().exec();
                // console.log("nonConvertedLeads = " + nonConvertedLeads)

                analytics.push({
                    nonConverted: nonConvertedLeads,
                    assignee: assignee.user.name
                })

            })

        var data = _(analytics).groupBy('assignee').map((objs, key) => ({
            total: objs.length,
            assignee: key,
            // source: (objs, 'source'),
            // value: objs
            nonConverted: parseInt(_.sumBy(objs, 'nonConverted')),
            converted: parseInt(_.sumBy(objs, 'converted')),

        })).value();
        return res.json(data)

        // console.log("Data Length = " + data.length)
        data.sort(function (a, b) {
            return b.total - a.total;
        });

        // return res.json(mapd)
        res.status(200).json({
            responseCode: 200,
            responseMessage: {
                // total: data.total
            },
            responseData: null
        });
    }
});

router.get('/leads/souces/counts/get', /* xAccessToken.token,*/ async function (req, res, next) {
    var rules = {
        // from: 'required',
        // to: 'required'
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
    } else {
        // req.headers['x-access-token var token = '];
        // var secret = config.secret;
        // var decoded = jwt.verify(token, secret);
        // var user = decoded.user;
        var date = new Date();
        var business = req.headers['business'];
        var from = new Date()
        var to = new Date()
        var analytics = [];

        if (parseInt(req.query.query) == 0) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else if (parseInt(req.query.query) >= 1) {
            var query = parseInt(req.query.query);
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        } else {
            var query = 30;
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - query);
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }


        var startDate = moment(from);
        var endDate = moment(to);
        var duration = endDate.diff(startDate, 'days', true);
        var range = { $gte: from, $lte: to };
        var totalJustDialLeads = 0;
        var analytics = [];

        await Lead.find({ business: business, updated_at: range })
            .cursor().eachAsync(async (lead) => {
                var month = moment(lead.updated_at).tz(req.headers['tz']).format('MMMM YYYY');
                if (duration <= 31) {
                    month = moment(lead.updated_at).tz(req.headers['tz']).format('MMM DD');
                }
                if (lead.remark.reason) {
                    analytics.push({ reason: lead.remark.reason })
                }

            });

        var data = _.chain(analytics)
            .groupBy("reason")
            .map((value, key) => ({
                reason: key,
                total: value.length

            }))
            .value()




        res.status(200).json({
            responseCode: 200,
            responseData: data

        });
    }
});

// Customer overview api end [Kaushlesh Pandey]
module.exports = router