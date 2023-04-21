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

var Log_Level = config.Log_Level

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

router.get('/services/getRole', xAccessToken.token, async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    // console.log('UserID', user)
    let getRole = await Management.findOne({ user: mongoose.Types.ObjectId(user) }).exec()

    res.status(200).json({
        role: getRole.role
    })
})

router.get('/business/category/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/business/category/get api called from auth.js");
    const categories = await Category.find({}).exec();
    if (categories.length > 0) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: categories
        });
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG :Categories get successfully");
        }
    } else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("Error :Error Occured, Unable to get categories");
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Error Occured",
            responseData: {}
        });
    }
    // res.status(200).json({
    //     responseCode: 200,
    //     responseMessage: "success",
    //     responseData: categories
    // });
});

router.get('/postals/get', async function (req, res, next) {
    var request_headers = JSON.stringify(req.headers)
    var request_query = JSON.stringify(req.query)
    businessFunctions.logs("INFO::/postals/get api called from auth.js," + " " + "Request Headers:" + request_headers + ", " + "Request Query:" + request_query);
    var rules = {
        zip: 'required'
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: validation failed,zip is required");
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
        console.time('looper')
        /*var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;*/
        var data = [];
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG:validated successfully and finding zip details from database," + " " + "Zip:" + req.query.zip);
        }
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

        console.timeEnd('looper')

        res.status(200).json({
            responseCode: 200,
            responseMessage: "",
            responseData: data
        })
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO:Zip details get successfully," + " " + "Zip:" + req.query.zip);
        }
    }
});

router.post('/signup', async function (req, res, next) {
    var request_headers = JSON.stringify(req.headers).trim()
    var request_body = JSON.stringify(req.body).trim()
    businessFunctions.logs("INFO:/signup Api called from auth.js," + " " + "Request Headers:" + request_headers + ", " + "Request Body:" + request_body)
    var rules = {
        contact_no: 'required',
    };
    //console.log("SIGNUP API -> erpWeb/console/auth/auth.js")

    var validation = new Validator(req.body, rules);
    req.body['whatsAppChannelId'] = '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2';
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
    } else {
        if (req.body.name) {
            var busuness_name = await User.find({ name: req.body.name }).count().exec();
        } else {
            var busuness_name = 0;
        }

        if (req.body.email) {
            var checkEmail = await User.find({ email: req.body.email }).count().exec();
        } else {
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
        } else {
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
            var checkPhone = await User.find({ contact_no: req.body.contact_no, "account_info.type": "business" }).count().exec();
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

                User.create(req.body).then(async function (user) {
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
                        } else {
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

                            await User.findOneAndUpdate({ _id: user._id }, { $set: data }, function (err, doc) {

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
                            } else {
                                // res.status(400).json({
                                //     responseCode: 400,
                                //     responseMessage: "Some Plans already active.",
                                //     responseData: {}
                                // });
                                // console.log("Some Plans already active.")
                            }
                        }
                    }
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
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG:autroidSignUpMail(user) function called.");
                    }
                    event.autroidSignUpMail(user)
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG:autroidSignUpSMS(user) function called.");
                    }
                    event.autroidSignUpSMS(user)
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG:autroidOnboardings(user) function called.");
                    }
                    event.autroidOnboardings(user)
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG:otpSms(user) function called.");
                    }
                    event.otpSms(user);
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG:whatsAppEvent.welOnBoard(user.name, user.contact_no, user._id) function called.");
                    }
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
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO:Business registered successfully," + " " + "User:" + JSON.stringify(user));
                    }
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Business registered successfully",
                        responseData: {
                            user: user,
                            // manifest: manifest,
                        },
                    });
                });
            } else {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING: Phone number already in use," + " " + "contact_no:" + req.body.contact_no);
                }
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

router.get('/cars/brand/get', /*xAccessToken.token,*/ async function (req, res, next) {
    businessFunctions.logs("INFO:/cars/brand/get Api called from auth.js," + " " + "Request Query:" + JSON.stringify(req.query))
    var rules = {
        query: 'required'
    };
    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR:Validation failed, cannot get req.query")
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
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG:find cars brand from database")
        }
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
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO:Successfully get cars brand.")
        }
        /**/
    }
});


module.exports = router