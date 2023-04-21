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



// vinay code

router.post("/add-quotation-payment", async (req, res, next) => {
    businessFunctions.logs("INFO:/add-quotation-payment Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    // console.log("Payment data...", req.body)

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Order Bill Details, BillId:" + req.body.bill);
    }
    let order = await Purchase.findOne({ _id: mongoose.Types.ObjectId(req.body.bill) }).exec()

    if (order) {
        let paidAmount = parseInt(req.body.amount)
        let remaining_amount = parseInt(order.payment.remaining_amount)
        let totalAmount = parseInt(order.payment.total)
        if (remaining_amount >= paidAmount) {
            let remainingAmount = remaining_amount - paidAmount
            order.payment.remaining_amount = remainingAmount
            order.payment.payment_mode = req.body.payment_mode
            order.payment.transaction_id = req.body.transaction_id
            order.payment.date = req.body.date
            order.payment.paid_total = Math.abs(totalAmount - parseInt(remainingAmount))

            order.markModified("payment")
            order.save()

            let purchasedLogs = {
                order: order.quotation,
                created_at: new Date(),
                updated_at: new Date(),
                logs: "Payment Received of " + req.body.amount + " Rs"
            }

            PurchaseOrderLogs.create(purchasedLogs, (err, data) => {
                if (err) {
                    // console.log("error in payment received logs..")
                } else {
                    // console.log("Payment received log...")
                }
            })
            return res.json({
                responseCode: "200",
                responseMessage: "Payment saved successfully."
            })
        } else {
            return res.json({
                responseCode: "500",
                responseMessage: "Your are paying more than the part costs"
            })
        }
    }
    res.json({
        message: "Payment data is called.."
    })
})

router.get("/quotation-payment-status", async (req, res, next) => {
    // console.log("result", req.query.vendor, req.query.quotation)
    let bill = req.query.bill
    let vendorOrder = await Purchase.findOne({ _id: mongoose.Types.ObjectId(bill) }).exec()

    res.json({
        bill: vendorOrder
    })
})

router.put("/remove/item", async (req, res, next) => {
    businessFunctions.logs("INFO: /remove/item Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    let index = req.body.index
    let quotation = req.body.quotation

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Removing Part from the order, OrderId:" + quotation);
    }
    VendorOrders.find({ quotation: mongoose.Types.ObjectId(quotation) })
        .cursor().eachAsync(async o => {
            // console.log("Parts length...", o.parts.length)
            await o.parts.splice(0, parseInt(index))
            // console.log("Parts length after splice...", o.parts.length)
            o.markModified("parts")
            o.save()
        })
    // console.log("Orders..", orders)
    let orders = await VendorOrders.find({ quotation: mongoose.Types.ObjectId(quotation) }).exec()

    let data = {
        quot: orders,
        quotation: orders,
        quotationStatus: "Requested",
        state: "Requested",
        user: undefined,
        advisor: undefined,
        booking: undefined,
        category: "all",
        message: "Part Removed"
    }
    res.json({
        responseMessage: 'Parts Removed',
        responseData: data
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Parts Removed Successfully, OrderId:" + quotation);
    }
})


//Abhinav Start Purchase Order 
router.post('/purchase/order/create', async (req, res, next) => {
    businessFunctions.logs("INFO: /purchase/order/create Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();
    var parts = [];
    var loggedInDetails = await User.findById(user).exec();
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Vendor details, VendorId:" + req.body.vendor + ", " + "User:" + loggedInDetails.name);
    }
    var vendor = await User.findById(req.body.vendor).exec();
    if (vendor) {
        var car = null;
        var booking = null;
        if (req.body.booking) {
            car = booking.car
            booking = req.body.booking
        }
        var orderNo = await VendorOrders.find({ business: business }).count();
        var data = {
            vendor: vendor._id,
            business: business,
            car: car,
            booking: booking,
            parts: parts,
            // parts: quotationsPart,
            order_link: 'http://localhost:4200/vendors/orders?id=',
            shop_name: vendor.name,
            contact_no: vendor.contact_no,
            email: vendor.email,
            totalQuotations: 0,
            status: 'Confirmed',
            order_status: "Open",
            quotation: null,
            order_no: orderNo + 1,
            created_at: new Date(),
            updated_at: new Date(),
        }
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Creating New Purchase Order, Vendor Name:" + vendor.name + ", " + "User:" + loggedInDetails.name);
        }
        await VendorOrders.create(data).then(async function (order) {

            var activity = {
                business: business,
                activity_by: loggedInDetails.name,
                activity: "Order Created",
                // time: new Date().getTime.toLocaleTimeString(),
                remark: "",
                created_at: new Date(),
            }
            // console.log("Activity")
            businessFunctions.vendorOrderLogs(order._id, activity);
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Purchase Order Created",
                responseData: {
                    order: order,
                    user: user,
                }
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Purchase Order Created Successfully, User:" + loggedInDetails.name);
            }

        })
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Vendor Not Found for the given vendorId:" + req.body.vendor + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Vendor Not Found",
            responseData: {}
        });
    }




})
// purchase/order/get
router.get('/purchase/order/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /purchase/order/get Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();
    // order_status: { $in: ['Open'] 
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Order Details, OrderId:" + req.query.id + ", " + "User:" + user.name);
    }
    var order = await VendorOrders.findOne({ _id: req.query.id })
        .populate({ path: 'business', select: "name contact_no address" })
        .populate({ path: 'vendor', select: "name contact_no address" })
        .populate('car')
        .populate('address')
        .exec();
    if (order) {
        var salesOrder = await BusinessOrder.findOne({ order: order.order }).exec();
        var salesitems = []
        if (salesOrder) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: fun.getBusinessOrderItems(salesOrder.order, salesOrder.business, req.headers['tz']) function called from function.js for fatching sales items details.");
            }
            salesitems = await q.all(fun.getBusinessOrderItems(salesOrder.order, salesOrder.business, req.headers['tz']))
        }

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Sending Order Details in Response, OrderId:" + req.query.id + ", " + "User:" + user.name);
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Sucesss",
            responseData: {
                order: order,
                saleOrder: {
                    order: salesOrder,
                    items: salesitems,
                }
            }
        });
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Order not found with the given orderId:" + req.query.id + ", " + "User:" + user.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {

            }
        });
    }
});

//17-08-21

router.post('/purchase/items/add', async (req, res, next) => {
    businessFunctions.logs("INFO: /purchase/items/add Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var loggedInDetails = await User.findById(decoded.user).exec();
    var part = req.body.item;
    var orderId = req.body.order;
    // var status = req.body.status
    // console.log("parts  ", parts)
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching order details for the given orderId:" + orderId + ", " + "User:" + loggedInDetails.name);
    }
    var order = await VendorOrders.findById(orderId).exec();
    if (order) {
        var items = order.parts
        var tax = []
        var total = 0
        // console.log("parts ", parts)
        if (part) {
            // for (var p = 0; p < parts.length; p++) {
            if (part.quantity != null) {
                var tax_info = await Tax.findOne({ tax: part.tax }).exec();
                if (tax_info) {
                    // console.log("Product ")
                    var tax_rate = tax_info.detail;
                    var base = parseFloat(part.unit_base_price) * parseFloat(part.quantity);
                    // console.log("Base  = " + unit_base_price)
                    var discount = part.discount;
                    var amount = parseFloat(part.unit_base_price) * parseFloat(part.quantity);
                    if (discount.indexOf("%") >= 0) {
                        discount = parseFloat(discount);
                        if (!isNaN(discount) && discount > 0) {
                            var discount_total = amount * (discount / 100);
                            amount = amount - parseFloat(discount_total.toFixed(2))
                        }
                    }
                    else {
                        discount = parseFloat(discount);
                        if (!isNaN(discount) && discount > 0) {
                            base = base - parseFloat(discount.toFixed(2))
                        }
                    }

                    if (part.amount_is_tax == "exclusive") {
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("DEBUG: Calculate Tax amount for parts");
                        }

                        var tax_on_amount = amount;

                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t;
                                    // console.log("Tax AMO=" + t)
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                                else {
                                    var t = tax_on_amount * (tax_info.rate / 100);
                                    amount = amount + t;
                                    // console.log("Tax AMO=" + t)

                                    tax.push({
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                            }
                        }
                        total = total + amount;

                        // console.log("Amount  = " + amount)
                    }

                    if (part.amount_is_tax == "inclusive") {
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
                        total = total + amount;
                    }

                    var tax_details = {
                        tax: tax_info.tax,
                        rate: tax_info.rate,
                        amount: total,
                        detail: tax
                    }

                    items.push({
                        part_no: part.part_no,
                        hsn_sac: part.hsn_sac,
                        item: part.title,
                        quantity: part.quantity,
                        stock: part.quantity * part.lot,
                        sku: part.sku,
                        unit: part.unit,
                        lot: part.lot,
                        mrp: part.unit_price,
                        amount: amount,
                        base: base,
                        unit_base_price: parseFloat(part.unit_base_price),
                        tax_amount: _.sumBy(tax, x => x.amount),
                        unit_price: amount / parseFloat(part.quantity),
                        amount_is_tax: part.amount_is_tax,
                        margin: parseFloat(part.margin),
                        sell_price: parseFloat(part.unit_base_price) + parseFloat(part.margin),
                        rate: parseFloat(part.unit_base_price) + parseFloat(part.margin),
                        discount: part.discount,
                        discount_type: part.discount_type,
                        discount_total: discount_total,
                        tax: tax_info.tax,
                        tax_rate: tax_info.rate,
                        tax_info: tax,
                        isChecked: part.false,
                        remark: part.remark,
                        sentDate: new Date(),
                        status: "confirmed"
                    });
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG: Push items details in the items array after calculating the tax for the parts.");
                    }


                    tax = [];
                    // }

                } else {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Please check tax",
                        responseData: {}
                    });
                }

            } else {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING: Invalid Quantity, Tax Type , Base Amount " + part.item + ", OrderId:" + orderId + ", " + "User:" + loggedInDetails.name);
                }
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Invalid Quantity, Tax Type , Base Amount " + part.item,
                    responseData: {}
                });
            }

            // }
            // && order.order_status != 'Open'
            if (order.status == 'Requested') {
                // console.log("Adede Quota")
                var quotation = await QuotationOrders.findOne({ _id: order.quotation }).exec();
                quotation.quotation_received = quotation.quotation_received + 1;
                await quotation.save();
            }

            var total_amount = _.sumBy(items, x => x.amount);
            // order_status: 'Open',
            // order_status: "Open",
            // status: 'confirmed',
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Add Part details in the order, orderId:" + orderId + ", " + "User:" + loggedInDetails.name);
            }

            await VendorOrders.findOneAndUpdate({ _id: orderId }, { $set: { parts: items, total_amount: total_amount, updated_at: new Date, } }, { new: false }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Error Occured while adding parts in the Order, OrderId:" + orderId + ", " + "User:" + loggedInDetails.name);
                    }
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error...",
                        responseData: err
                    });
                }
                else {

                    var activity = {
                        business: business,
                        activity_by: loggedInDetails.name,
                        activity: "Title: ' " + part.title + " ' , Qty: " + part.quantity + " , Amt: " + part.amount + " (Added)  ",
                        // time: new Date().getTime.toLocaleTimeString(),
                        remark: "New Part Added",
                        created_at: new Date(),
                    }
                    // console.log("Activity")
                    businessFunctions.vendorOrderLogs(order._id, activity);
                    // await QuotationOrders.findByOneAndUpdate({_id:order.quotation},{$set:{quotation_submitted:}})
                }
            });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Saved",
                responseData: await VendorOrders.findById(orderId).exec()
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Part Saved Successfully in the Order, OrderId:" + orderId + ", " + "User:" + loggedInDetails.name);
            }
        }


    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Order Not Found for the given orderId:" + orderId + ", " + "User:" + loggedInDetails.name);
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Order Not Found ",
            responseData: {}

        });
    }
});

router.post('/send/sales-order', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /send/sales-order Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var car = null;
    var address = null;
    var items = [];
    var discount = 0;
    var total = 0;
    var due = {
        due: 0
    };
    var vendor = req.body.vendor;
    var vendorOrderId = req.body.order
    var user = await User.findById(business).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (user) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Vendor Order details for the vendor orderId:" + vendorOrderId + ", User:" + loggedInDetails.name);
        }

        var vendorOrder = await VendorOrders.findById(vendorOrderId).populate('vendor').exec();
        // console.log("Vendor Order = " + vendorOrder.vendor)
        // return res.json(vendorOrder)
        if (vendorOrder) {
            if (req.body.address) {
                var checkAddress = await Address.findOne({ _id: req.body.address, user: user._id }).exec();
                if (checkAddress) {
                    address = checkAddress._id;
                }
                else {
                    return res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Address not found",
                        responseData: {}
                    });
                }
            }
            /*else
            {
                return res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Address not found",
                    responseData: {}
                });
            }*/

            if (req.body.car) {
                var checkCar = await Car.findOne({ _id: req.body.car, user: user._id }).exec();
                if (checkCar) {
                    car = checkCar._id;
                }
                else {
                    return res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Car not found",
                        responseData: {}
                    });
                }
            }

            var date = new Date();
            var payment = {
                payment_mode: "",
                payment_status: "",
                extra_charges_limit: 0,
                convenience_charges: 0,
                discount_type: "",
                coupon_type: "",
                coupon: "",
                discount_applied: false,
                transaction_id: "",
                transaction_date: "",
                transaction_status: "",
                transaction_response: "",
                total: total,
                discount_total: discount,
                paid_total: 0,
            };
            var req_no = Math.round(+new Date() / 1000);
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Creating New Sales Order.");
            }

            await Order.create({
                convenience: req.body.convenience,
                time_slot: req.body.time_slot,
                user: user._id,
                car: car,
                address: address,
                items: items,
                business: vendorOrder.vendor,
                payment: payment,
                due: due,

                status: "Ordered",
                isPurchaseOrder: true,
                vendorOrder: vendorOrder._id,
                request_no: req_no,
                created_at: date,
                updated_at: date,
            }).then(async function (o) {
                var count = await Order.find({ _id: { $lt: o._id }, business: vendorOrder.vendor }).count();

                var order_no = Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000) + "-" + Math.ceil(count + 1);
                // console.log("Order NO + " + order_no)
                await Order.findOneAndUpdate({ _id: o._id }, { $set: { order_no: order_no } }, { new: true }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Error Occured while updating the order details, orderId:" + o._id);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Errro",
                            responseData: err
                        });
                    }
                    else {
                        var businessOrder = {
                            order: o._id,
                            _order: order_no,
                            due_date: null,
                            delivery_date: null,
                            convenience: req.body.convenience,
                            time_slot: req.body.time_slot,
                            user: user._id,
                            items: items,
                            business: vendorOrder.vendor,
                            payment: payment,
                            status: "Confirmed",
                            isPurchaseOrder: true,
                            vendorOrder: vendorOrder._id,
                            created_at: date,
                            updated_at: date,
                            due: due
                        };
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("DEBUG: Creating New Business Order.");
                        }
                        await BusinessOrder.create(businessOrder).then(async function (bo) {
                            var count = await BusinessOrder.find({ _id: { $lt: bo._id }, business: vendorOrder.vendor }).count();
                            var order_no = count + 1;

                            await BusinessOrder.findOneAndUpdate({ _id: bo._id }, { $set: { order_no: order_no } }, { new: true }, async function (err, doc) {

                                var order = await BusinessOrder.findById(bo._id)
                                    .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                                    .exec();

                                var items = await OrderLine.find({ order: order.order._id, business: vendor }).exec();

                                // var req_no = Math.round(+new Date() / 1000);
                                // $set: { order: o._id, isOrder: true, orderSent: true, request_no: req_no } 
                                await VendorOrders.findOneAndUpdate({ _id: vendorOrder._id }, { $set: { order: o._id, isOrder: true, orderSent: true, request_no: req_no } }, { new: true }, async function (err, doc) {
                                    if (err) {
                                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                                            businessFunctions.logs("ERROR: Error Occured while updating the Vendor order details, orderId:" + vendorOrder._id + ", User:" + loggedInDetails.name);
                                        }
                                        res.status(422).json({
                                            responseCode: 422,
                                            responseMessage: "Server Errro",
                                            responseData: err
                                        });
                                    }
                                    else {

                                        var activity = {
                                            business: business,
                                            activity_by: loggedInDetails.name,
                                            activity: "Order sent to the Seller -> " + vendorOrder.vendor.name,

                                            remark: "Order Sent",
                                            created_at: new Date(),
                                        }
                                        businessFunctions.vendorOrderLogs(vendorOrder._id, activity);


                                        var activity = {
                                            business: business,
                                            activity_by: loggedInDetails.name,
                                            activity: "Order Received from ' " + loggedInDetails.name + " '",
                                            remark: "Order Received",
                                            created_at: new Date(),
                                        }
                                        businessFunctions.salesOrderLogs(o._id, activity);
                                    }
                                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                        businessFunctions.logs("DEBUG:  whatsAppEvent.orderPurchase(doc._id) function called.");
                                    }
                                    whatsAppEvent.orderPurchase(doc._id);
                                    var activity = 'Purchase Order'
                                    fun.webNotification(activity, doc);
                                })
                                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("DEBUG: Sending Order to the Seller, Seller Name:" + vendorOrder.vendor.name + ", " + "User:" + loggedInDetails.name);
                                }

                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "",
                                    responseData: {
                                        _id: order._id,
                                        id: order._id,
                                        order_no: order.order_no,
                                        order: order.order._id,
                                        _order: order._order,
                                        convenience: order.order.convenience,
                                        car: order.order.car,
                                        user: order.order.user,
                                        address: order.order.address,
                                        items: items,
                                    }
                                });
                                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                    businessFunctions.logs("INFO: Order sent to the Seller Successfully, Seller Name:" + vendorOrder.vendor.name + ", " + "User:" + loggedInDetails.name);
                                }
                            });
                        });
                    }
                });
            });
        } else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Purchase Order not found with the given vendor orderId:" + vendorOrderId + ", User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Purchase Order not found",
                responseData: {}
            });
        }
    }
    else {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: User not found for the given businessId:" + business);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "User not found",
            responseData: {}
        });
    }
});

router.put('/purchase/order/status/update', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /purchase/order/status/update Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var status = req.body.status
    // console.log("Status = " + status)
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Order Details, OrderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
    }
    var order = await VendorOrders.findOne({ _id: req.body.order, business: business, order_status: { $nin: ['Cancelled'] } }).exec();
    if (order) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Updating Order Status,Status:" + req.body.status + ", " + "OrderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
        }
        await VendorOrders.findOneAndUpdate({ _id: order._id }, { $set: { status: status, order_status: status, updated_at: new Date() } }, { new: true }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Errro",
                    responseData: err
                });
            }
            else {

                var isSalesOrder = await Order.findOne({ vendorOrder: order._id, status: { $nin: ['Cancelled'] } }).exec();
                if (isSalesOrder) {

                    await Order.findOneAndUpdate({ vendorOrder: order._id, status: { $nin: ['Cancelled'] } }, { $set: { status: "Delivered", updated_at: new Date() } }, { new: true }, async function (err, salesOrder) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Errro",
                                responseData: err
                            });
                        }
                        else {
                            await BusinessOrder.findOneAndUpdate({ vendorOrder: order._id }, { $set: { status: 'Delivered', updated_at: new Date() } }, { new: false }, async function (err, doc) {
                                if (err) {
                                    return res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error",
                                        responseData: err
                                    });
                                } else {
                                    var activity = {
                                        business: business,
                                        activity_by: loggedInDetails.name,
                                        activity: "Order " + status,
                                        remark: "Orderm Received by Purchaser",
                                        created_at: new Date(),
                                    }
                                    businessFunctions.salesOrderLogs(doc.order, activity);
                                }

                            })




                        }


                    })
                }

                if (status == "Received") {

                    var activity = 'Order Received'
                    fun.webNotification(activity, doc);
                    whatsAppEvent.orderDeliverd(doc.business, doc.order_no, doc.vendor)

                    //whatsAppEvent.orderCancel(doc.business, doc.vendor, doc.order_no)
                }

                if (status == "Cancelled") {

                    var activity = 'Order Cancelled'
                    fun.webNotification(activity, doc);

                    whatsAppEvent.orderCancel(doc.business, doc.vendor, doc.order_no)
                }

                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Order " + status,
                    // time: new Date().getTime.toLocaleTimeString(),
                    remark: "Order " + status,
                    created_at: new Date(),
                }
                businessFunctions.vendorOrderLogs(order._id, activity);
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Order Status Updated",
                    responseData: {

                    }
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Order Status Updated Successfully, OrderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
                }

            }
        })
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Order not found for the given orderId:" + req.body.order + ", " + "User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order not found",
            responseData: {

            }
        });
    }
});

router.put('/sale-purchase/linked/item/mark', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO:/sale-purchase/linked/item/mark Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();

    var type = req.body.type;
    var item = req.body.item;
    var isMarked = req.body.isMarked
    var index = req.body.index;

    if (type == 'Sale') {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Order Item Details, OrderId:" + item.order + ", " + "Order Type: Sale, " + "User:" + user.name);
        }
        var order = await Order.findById(item.order).exec();
        if (order) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Updating the item Status isMarked for the item:" + item.order + ", " + "User:" + user.name);
            }
            await OrderLine.findOneAndUpdate({ _id: item._id }, { $set: { isMarked: isMarked, updated_at: new Date() } }, { new: true }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Error Occured while updating the item status, ItemId:" + item._id + ", " + "OrderId:" + item.order + ", " + "User:" + user.name);
                    }
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Errro",
                        responseData: err
                    });
                }
                else {

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Item Marked",
                        responseData: doc
                    });
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO: Item Marked Successfully, Item:" + item.item + ", " + "OrderId:" + item.order + ", " + "User:" + user.name);
                    }
                }
            });
        }
        // console.log("Item Id =" + item._id)

    } else if (type == 'Purchase') {
        var vendorOrderId = req.body.vendorOrderId
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Order Item Details, OrderId:" + vendorOrderId + ", " + "Order Type: Purchase, " + "User:" + user.name);
        }
        var vendorOrder = await VendorOrders.findById(vendorOrderId).exec();
        // var purchaserParts = _.filter(vendorOrder.parts, type => type._id.equals(item._id));
        for (var i = 0; i < vendorOrder.parts.length; i++) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Updating the item Status isMarked for the item:" + item.item + ", " + "OrderId:" + vendorOrderId + ", " + "User:" + user.name);
            }
            if (vendorOrder.parts[i]._id.equals(item._id)) {
                vendorOrder.parts[i].isMarked = true
                break;
            }
        }
        vendorOrder.markModified('parts')
        await vendorOrder.save();

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Item Marked",
            responseData: vendorOrder
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Item Marked Successfully, Item:" + item.item + ", " + "OrderId:" + vendorOrderId + ", " + "User:" + user.name);
        }

    }








    // var order = await VendorOrders.findOne({ _id: req.body.order, business: business, order_status: { $nin: ['Cancelled'] } }).exec();
    // if (order) {
    //     await VendorOrders.findOneAndUpdate({ _id: order._id }, { $set: { status: 'Cancelled', order_status: 'Cancelled', updated_at: new Date() } }, { new: true }, async function (err, doc) {
    //         if (err) {
    //             var salesOrder = await Order.findOneAndUpdate({ vendorOrder: order._id, status: { $nin: ['Cancelled'] } }).exec();
    //             if (salesOrder) {

    //             }
    //             res.status(422).json({
    //                 responseCode: 422,
    //                 responseMessage: "Server Errro",
    //                 responseData: err
    //             });
    //         }
    //         else { }
    //     })
    //     res.status(200).json({
    //         responseCode: 200,
    //         responseMessage: "Order Cancelled",
    //         responseData: {

    //         }
    //     });
    // } else {
    //     res.status(400).json({
    //         responseCode: 400,
    //         responseMessage: "Order not found",
    //         responseData: {

    //         }
    //     });
    // }
});
// purchase/order/status/update
// router.put('/purchase/order/status/update', xAccessToken.token, async function (req, res, next) {
//     var token = req.headers['x-access-token'];
//     var secret = config.secret;
//     var decoded = jwt.verify(token, secret);
//     var business = req.headers['business'];


//     var vendorOrder = await VendorOrders.findById(req.body.order).exec();
//     // var purchaserParts = _.filter(vendorOrder.parts, type => type._id.equals(item._id));
//     if (vendorOrder) {

//         await VendorOrders.findOneAndUpdate({ _id: order._id }, { $set: { status: 'Cancelled', order_status: 'Cancelled', updated_at: new Date() } }, { new: true }, async function (err, doc) {
//             if (err) {
//                 var salesOrder = await Order.findOneAndUpdate({ vendorOrder: order._id, status: { $nin: ['Cancelled'] } }).exec();
//                 if (salesOrder) {

//                 }
//                 res.status(422).json({
//                     responseCode: 422,
//                     responseMessage: "Server Errro",
//                     responseData: err
//                 });
//             }
//             else { }
//         })

//         res.status(200).json({
//             responseCode: 200,
//             responseMessage: "Item Marked",
//             responseData: vendorOrder
//         });
//     }













//     // var order = await VendorOrders.findOne({ _id: req.body.order, business: business, order_status: { $nin: ['Cancelled'] } }).exec();
//     // if (order) {
//     //     await VendorOrders.findOneAndUpdate({ _id: order._id }, { $set: { status: 'Cancelled', order_status: 'Cancelled', updated_at: new Date() } }, { new: true }, async function (err, doc) {
//     //         if (err) {
//     //             var salesOrder = await Order.findOneAndUpdate({ vendorOrder: order._id, status: { $nin: ['Cancelled'] } }).exec();
//     //             if (salesOrder) {

//     //             }
//     //             res.status(422).json({
//     //                 responseCode: 422,
//     //                 responseMessage: "Server Errro",
//     //                 responseData: err
//     //             });
//     //         }
//     //         else { }
//     //     })

// });

router.put('/purchase/order/address/update', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /purchase/order/address/update Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var rules = {
        order: 'required',
        address: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, order and address is required to update purchase address.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Due Date required",
            responseData: {
                res: validation.errors.all()
            }
        });
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var loggedInDetails = await User.findById(decoded.user).exec();
        var date = new Date();

        var items = [];
        var data = [];

        var item_total = 0;
        var discount = 0;
        var item_total = 0;
        var total = 0;

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Order details, OrderId:" + req.body.order + ", User:" + loggedInDetails.name);
        }
        var order = await VendorOrders.findById(req.body.order).exec();
        var loggedInDetails = await User.findById(decoded.user).exec();
        if (order) {
            var address = await Address.findOne({ _id: req.body.address, user: order.vendor }).exec();
            if (address) {
                VendorOrders.findOneAndUpdate({ _id: order._id }, { $set: { address: address._id } }, { new: false }, async function (err, doc) {
                    if (err) {
                        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                            businessFunctions.logs("ERROR: Error Occured while Updating the purcahse order address for the orderId:" + req.body.order + ", User:" + loggedInDetails.name);
                        }
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {

                        var activity = {
                            business: business,
                            activity_by: loggedInDetails.name,
                            activity: "Address Updated",
                            // time: new Date().getTime.toLocaleTimeString(),
                            remark: "",
                            created_at: new Date(),
                        }
                        // console.log("Activity")
                        businessFunctions.vendorOrderLogs(order._id, activity);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Saved",
                            responseData: {
                                address: address
                            }
                        });
                        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("INFO: Address Updated Successfully for the order, OrderId:" + req.body.order + ", User:" + loggedInDetails.name);
                        }
                    }
                });
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Address not found",
                    responseData: {

                    }
                });
            }
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Order not found for the orderId:" + req.body.order + ", User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});




// To Continue 20-08-21
router.post('/order/convert/bill', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /order/convert/bill Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    let reference_no = req.body.reference_no
    var rules = {
        bill: 'required',
    };
    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Bill is required to convert order in bill.");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Bill is required",
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
        var loggedInDetails = await User.findById(decoded.user).exec();
        var product = new Object();
        var result = [];
        var tax = [];
        var total = 0;
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Purchase Order details, OrderId:" + req.body.bill + ", User:" + loggedInDetails.name);
        }
        var purchase = await Purchase.findById(req.body.bill).exec();
        if (purchase) {
            // console.log("VendorOrder Id  = " + purchase.vendorOrder)
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Fatching Vendor Order details, OrderId:" + purchase.vendorOrder + ", User:" + loggedInDetails.name);
            }
            var vendorOrder = await VendorOrders.findById(purchase.vendorOrder).exec();
            var order = await Order.findById(vendorOrder.order).exec();
            // console.log("Order  = " + order._id)
            // var count = await VendorOrders.findById(purchase.vendorOrder).count().exec();
            // console.log("VendorOrder Id  = " + vendorOrder._id + " Count = " + count)
            // return res.json(vendorOrder)
            if (order) {
                if (vendorOrder) {
                    if (req.body.due) {
                        var due = new Date(req.body.due).toISOString();
                    }
                    else {
                        var due = null
                    }
                    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("DEBUG: Fatching Vendor details, OrderId:" + vendorOrder.vendor + ", User:" + loggedInDetails.name);
                    }
                    var vendor = await User.findById(vendorOrder.vendor).exec();
                    var newDate = new Date();
                    if (vendor) {
                        var items = [];
                        //
                        var salesItem = await OrderLine.find({ order: order._id }).exec();
                        console.log("Sales Length = " + salesItem.length)
                        if (salesItem.length > 0) {
                            // console.log("1057 products length = " + products.length)
                            for (var p = 0; p < salesItem.length; p++) {
                                if (salesItem[p].status == 'Confirmed') {
                                    if (salesItem[p].quantity != null) {
                                        // console.log("Come inside business product finding condition....")
                                        var product = await BusinessProduct.findOne({
                                            $or: [{
                                                part_no: salesItem[p].part_no
                                            }, { title: salesItem[p].title }],
                                            business: business
                                        }).exec();
                                        var tax_info = await Tax.findOne({ tax: salesItem[p].tax }).exec();
                                        if (tax_info) {
                                            var tax_rate = tax_info.detail;
                                            if (product) {
                                                // console.log("IF Is Product = " + product._id)
                                                var quantity = parseInt(salesItem[p].quantity);
                                                var unit_base_price = parseFloat(salesItem[p].rate);
                                                var base = parseFloat(salesItem[p].base);
                                                var amount_is_tax = salesItem[p].amount_is_tax


                                                var discount = salesItem[p].discount_total;
                                                // console.log("Discount prints here...", discount)
                                                /*  if (discount.indexOf("%") >= 0) {
                                                      // console.log("602 - Discount If Condition = " + discount)
                                                      discount = parseFloat(discount);
                                                      if (!isNaN(discount) && discount > 0) {
                                                          var discount_total = amount * (discount / 100);
                                                          amount = amount - parseFloat(discount_total.toFixed(2))
                        
                                                      }
                                                  }
                                                  else {
                                                      // console.log("610 - Discount ELSE Condition= " + discount)
                        
                        
                                                      discount = parseFloat(discount);
                                                      if (!isNaN(discount) && discount > 0) {
                                                          amount = amount - parseFloat(discount.toFixed(2))
                        
                                                      }
                                                  }
                        */

                                                // console.log("Ammount after discount= " + amount)
                                                var amount_is_tax = "exclusive";
                                                if (amount_is_tax == "exclusive") {
                                                    var amount = base
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
                                                    total = total + amount;
                                                }
                                                // console.log("Ammount after Tax= " + amount)


                                                // if (salesItem[p].amount_is_tax == "inclusive") {
                                                //     var x = (100 + tax_info.rate) / 100;
                                                //     var tax_on_amount = amount / x;
                                                //     if (tax_rate.length > 0) {
                                                //         for (var r = 0; r < tax_rate.length; r++) {
                                                //             if (tax_rate[r].rate != tax_info.rate) {
                                                //                 var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                //                 base = base - t;
                                                //                 tax.push({
                                                //                     tax: tax_rate[r].tax,
                                                //                     rate: tax_rate[r].rate,
                                                //                     amount: parseFloat(t.toFixed(2))
                                                //                 });
                                                //             }
                                                //             else {
                                                //                 var t = amount - tax_on_amount;
                                                //                 base = base - t;
                                                //                 tax.push({
                                                //                     tax: tax_info.tax,
                                                //                     rate: tax_info.rate,
                                                //                     amount: parseFloat(t.toFixed(2))
                                                //                 });
                                                //             }
                                                //         }
                                                //     }
                                                //     total = total + amount;
                                                // }

                                                var tax_details = {
                                                    tax: tax_info.tax,
                                                    rate: tax_info.rate,
                                                    amount: total,
                                                    // amount: amount,
                                                    detail: tax
                                                }

                                                // console.log("product.unit....", product.unit)
                                                // console.log("Product " + product.product)
                                                var lot = 1
                                                items.push({
                                                    item_status: 'InComplete',
                                                    product: product._id,
                                                    part_no: salesItem[p].part_no,
                                                    hsn_sac: product.hsn_sac,
                                                    part_category: product.part_category,    //OEM OR OES
                                                    title: salesItem[p].item,
                                                    quantity: quantity,
                                                    stock: quantity * lot,
                                                    sku: product.sku,
                                                    unit_base_price: salesItem[p].rate,
                                                    unit_price: amount / quantity,
                                                    // purchase_price: purchase_price,
                                                    unit: salesItem[p].unit,
                                                    lot: lot,
                                                    mrp: salesItem[p].mrp,
                                                    rate: salesItem[p].rate,
                                                    base: base,
                                                    tax_amount: _.sumBy(tax, x => x.amount),
                                                    // tax_amount: tax_amount,
                                                    amount: amount,
                                                    // models: salesItem[p].models,
                                                    amount_is_tax: amount_is_tax,
                                                    sell_price: salesItem[p].rate,
                                                    margin: 0,
                                                    discount: salesItem[p].discount,
                                                    discount_type: '',
                                                    discount_total: salesItem[p].discount_total,
                                                    tax: tax_info.tax,
                                                    tax_rate: tax_info.rate,
                                                    tax_info: tax,
                                                    isProduct: true,
                                                    isOrderItem: true,
                                                });

                                                tax = [];
                                            }
                                            else {
                                                // console.log("ELSE Is Product ???")
                                                var quantity = parseInt(salesItem[p].quantity);
                                                var unit_base_price = parseFloat(salesItem[p].unit_base_price);
                                                var base = parseFloat(salesItem[p].base);
                                                var amount_is_tax = salesItem[p].amount_is_tax
                                                var discount = salesItem[p].discount;
                                                // console.log("Discount prints here...", discount)
                                                /*  if (discount.indexOf("%") >= 0) {
                                                      // console.log("602 - Discount If Condition = " + discount)
                                                      discount = parseFloat(discount);
                                                      if (!isNaN(discount) && discount > 0) {
                                                          var discount_total = amount * (discount / 100);
                                                          amount = amount - parseFloat(discount_total.toFixed(2))
                        
                                                      }
                                                  }
                                                  else {
                                                      // console.log("610 - Discount ELSE Condition= " + discount)
                        
                        
                                                      discount = parseFloat(discount);
                                                      if (!isNaN(discount) && discount > 0) {
                                                          amount = amount - parseFloat(discount.toFixed(2))
                        
                                                      }
                                                  }
                        */

                                                // console.log("Ammount after discount= " + amount)
                                                var amount_is_tax = "exclusive";

                                                if (amount_is_tax == "exclusive") {
                                                    var amount = base
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
                                                    total = total + amount;
                                                }
                                                // console.log("Ammount after Tax= " + amount)

                                                // if (salesItem[p].amount_is_tax == "inclusive") {
                                                //     var x = (100 + tax_info.rate) / 100;
                                                //     var tax_on_amount = amount / x;
                                                //     if (tax_rate.length > 0) {
                                                //         for (var r = 0; r < tax_rate.length; r++) {
                                                //             if (tax_rate[r].rate != tax_info.rate) {
                                                //                 var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                //                 base = base - t;
                                                //                 tax.push({
                                                //                     tax: tax_rate[r].tax,
                                                //                     rate: tax_rate[r].rate,
                                                //                     amount: parseFloat(t.toFixed(2))
                                                //                 });
                                                //             }
                                                //             else {
                                                //                 var t = amount - tax_on_amount;
                                                //                 base = base - t;
                                                //                 tax.push({
                                                //                     tax: tax_info.tax,
                                                //                     rate: tax_info.rate,
                                                //                     amount: parseFloat(t.toFixed(2))
                                                //                 });
                                                //             }
                                                //         }
                                                //     }
                                                //     total = total + amount;
                                                // }

                                                var tax_details = {
                                                    tax: tax_info.tax,
                                                    rate: tax_info.rate,
                                                    amount: total,
                                                    // amount: amount,
                                                    detail: tax
                                                }
                                                var lot = 1
                                                // console.log("Unit Base  Price  = " + (base / quantity))
                                                items.push({
                                                    item_status: 'InComplete',
                                                    product: null,
                                                    part_no: salesItem[p].part_no,
                                                    hsn_sac: salesItem[p].hsn_sac,
                                                    part_category: salesItem[p].part_category,    //OEM OR OES
                                                    title: salesItem[p].title,
                                                    quantity: quantity,
                                                    stock: quantity * lot,
                                                    // sku: salesItem[p].sku,
                                                    unit_base_price: base / quantity,
                                                    unit_price: amount / quantity,
                                                    unit: salesItem[p].unit,
                                                    lot: lot,
                                                    mrp: salesItem[p].mrp,
                                                    rate: salesItem[p].rate,
                                                    base: base,
                                                    tax_amount: _.sumBy(tax, x => x.amount),
                                                    amount: amount,
                                                    models: [],
                                                    amount_is_tax: amount_is_tax,
                                                    sell_price: salesItem[p].rate,
                                                    margin: 0,
                                                    discount: discount,
                                                    discount_type: '',
                                                    discount_total: salesItem[p].discount_total,
                                                    tax: tax_info.tax,
                                                    tax_rate: tax_info.rate,
                                                    tax_info: tax,
                                                    isProduct: false,
                                                    isOrderItem: true,

                                                });

                                                tax = [];
                                            }
                                        }
                                        else {
                                            res.status(422).json({
                                                responseCode: 422,
                                                responseMessage: "Please check tax",
                                                responseData: {}
                                            });
                                        }
                                    }
                                }
                            }


                            var address = null;
                            if (req.body.address) {
                                address = req.body.address;
                            }
                            var log_details = {
                                business: business,
                                activity_by: loggedInDetails.name,
                                activity: "Update",
                                remark: "Order To Bill Conversion",
                                created_at: new Date(),
                            }
                            var logs = []
                            if (purchase.logs) {
                                logs = purchase.logs

                            } else {
                                logs.push(log_details)
                            }
                            var total = _.sumBy(items, x => x.amount);
                            var discount_total = 0;
                            var discount = 0
                            var paid_total = total.toFixed(2)
                            if (req.body.bill_discount > 0) {

                                // console.log(" bILL Discount = " + req.body.bill_discount)
                                discount = parseFloat(req.body.bill_discount);
                                paid_total = total.toFixed(2)

                                if (!isNaN(discount) && discount > 0) {
                                    discount_total = total * (discount / 100);
                                    paid_total = paid_total - parseFloat(discount_total.toFixed(2))
                                }

                            }
                            var bill = {
                                due_date: due,
                                vendor: vendor._id,
                                items: items,
                                bill_discount: discount,
                                paid_total: paid_total,
                                total_discount: discount_total,
                                business: business,
                                total: paid_total,
                                subTotal: total.toFixed(2),
                                logs: logs,
                                // vendorOrder: vendorOrder._id,
                                updated_at: new Date(),
                            };
                            await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: bill }, { new: false }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error...",
                                        responseData: err
                                    });
                                }
                                else {
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Successfully Saved",
                                        responseData: await Purchase.findById(req.body.bill).exec()
                                    });
                                }
                            });
                        }
                        ///
                        /*
                                            var products = vendorOrder.parts;
                                            if (products.length > 0) {
                                                // console.log("1057 products length = " + products.length)
                                                for (var p = 0; p < products.length; p++) {
                                                    if (products[p].status == 'confirmed') {
                                                        if (products[p].quantity != null) {
                                                            // console.log("Come inside business product finding condition....")
                                                            var product = await BusinessProduct.findOne({
                                                                $or: [{
                                                                    part_no: products[p].part_no
                                                                }, { title: products[p].title }],
                                                                business: business
                                                            }).exec();
                                                            var tax_info = await Tax.findOne({ tax: products[p].tax }).exec();
                                                            if (tax_info) {
                                                                var tax_rate = tax_info.detail;
                                                                if (product) {
                                                                    // console.log("IF Is Product = " + product._id)
                                                                    var quantity = parseInt(products[p].quantity);
                                                                    var unit_base_price = parseFloat(products[p].unit_base_price);
                                                                    var base = parseFloat(products[p].unit_base_price) * quantity;
                                                                    var amount_is_tax = products[p].amount_is_tax
                        
                        
                                                                    var discount = products[p].discount;
                                                                    // console.log("Discount prints here...", discount)
                                                                    //   if (discount.indexOf("%") >= 0) {
                                                                    //       // console.log("602 - Discount If Condition = " + discount)
                                                                    //       discount = parseFloat(discount);
                                                                    //       if (!isNaN(discount) && discount > 0) {
                                                                    //           var discount_total = amount * (discount / 100);
                                                                    //           amount = amount - parseFloat(discount_total.toFixed(2))
                        
                                                                    //       }
                                                                    //   }
                                                                    //   else {
                                                                    //       // console.log("610 - Discount ELSE Condition= " + discount)
                        
                        
                                                                    //       discount = parseFloat(discount);
                                                                    //       if (!isNaN(discount) && discount > 0) {
                                                                    //           amount = amount - parseFloat(discount.toFixed(2))
                        
                                                                    //       }
                                                                    //   }
                        
                        
                                                                    // console.log("Ammount after discount= " + amount)
                                                                    var amount_is_tax = "exclusive";
                                                                    if (amount_is_tax == "exclusive") {
                                                                        var amount = base
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
                                                                        total = total + amount;
                                                                    }
                                                                    // console.log("Ammount after Tax= " + amount)
                        
                        
                                                                    // if (products[p].amount_is_tax == "inclusive") {
                                                                    //     var x = (100 + tax_info.rate) / 100;
                                                                    //     var tax_on_amount = amount / x;
                                                                    //     if (tax_rate.length > 0) {
                                                                    //         for (var r = 0; r < tax_rate.length; r++) {
                                                                    //             if (tax_rate[r].rate != tax_info.rate) {
                                                                    //                 var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                                    //                 base = base - t;
                                                                    //                 tax.push({
                                                                    //                     tax: tax_rate[r].tax,
                                                                    //                     rate: tax_rate[r].rate,
                                                                    //                     amount: parseFloat(t.toFixed(2))
                                                                    //                 });
                                                                    //             }
                                                                    //             else {
                                                                    //                 var t = amount - tax_on_amount;
                                                                    //                 base = base - t;
                                                                    //                 tax.push({
                                                                    //                     tax: tax_info.tax,
                                                                    //                     rate: tax_info.rate,
                                                                    //                     amount: parseFloat(t.toFixed(2))
                                                                    //                 });
                                                                    //             }
                                                                    //         }
                                                                    //     }
                                                                    //     total = total + amount;
                                                                    // }
                        
                                                                    var tax_details = {
                                                                        tax: tax_info.tax,
                                                                        rate: tax_info.rate,
                                                                        amount: total,
                                                                        // amount: amount,
                                                                        detail: tax
                                                                    }
                        
                                                                    // console.log("product.unit....", product.unit)
                                                                    // console.log("Product " + product.product)
                                                                    var lot = 1
                                                                    items.push({
                                                                        item_status: 'InComplete',
                                                                        product: product._id,
                                                                        part_no: products[p].part_no,
                                                                        hsn_sac: product.hsn_sac,
                                                                        part_category: product.part_category,    //OEM OR OES
                                                                        title: products[p].item,
                                                                        quantity: quantity,
                                                                        stock: quantity * lot,
                                                                        sku: product.sku,
                                                                        unit_base_price: products[p].unit_base_price,
                                                                        unit_price: amount / quantity,
                                                                        // purchase_price: purchase_price,
                                                                        unit: product.unit,
                                                                        lot: lot,
                                                                        mrp: products[p].mrp,
                                                                        rate: unit_base_price + products[p].margin,
                                                                        base: base,
                                                                        tax_amount: _.sumBy(tax, x => x.amount),
                                                                        // tax_amount: tax_amount,
                                                                        amount: amount,
                                                                        models: products[p].models,
                                                                        amount_is_tax: amount_is_tax,
                                                                        sell_price: unit_base_price + products[p].margin,
                                                                        margin: products[p].margin,
                                                                        discount: discount,
                                                                        discount_type: products[p].discount_type,
                                                                        discount_total: products[p].discount_total,
                                                                        tax: tax_info.tax,
                                                                        tax_rate: tax_info.rate,
                                                                        tax_info: tax,
                                                                        isProduct: true,
                                                                        isOrderItem: true,
                                                                    });
                        
                                                                    tax = [];
                                                                }
                                                                else {
                                                                    // console.log("ELSE Is Product ???")
                                                                    var quantity = parseInt(products[p].quantity);
                                                                    var unit_base_price = parseFloat(products[p].unit_base_price);
                                                                    var base = parseFloat(products[p].unit_base_price) * quantity;
                                                                    var amount_is_tax = products[p].amount_is_tax
                                                                    var discount = products[p].discount;
                                                                    // console.log("Discount prints here...", discount)
                                                                    //   if (discount.indexOf("%") >= 0) {
                                                                    //       // console.log("602 - Discount If Condition = " + discount)
                                                                    //       discount = parseFloat(discount);
                                                                    //       if (!isNaN(discount) && discount > 0) {
                                                                    //           var discount_total = amount * (discount / 100);
                                                                    //           amount = amount - parseFloat(discount_total.toFixed(2))
                        
                                                                    //       }
                                                                    //   }
                                                                    //   else {
                                                                    //       // console.log("610 - Discount ELSE Condition= " + discount)
                        
                        
                                                                    //       discount = parseFloat(discount);
                                                                    //       if (!isNaN(discount) && discount > 0) {
                                                                    //           amount = amount - parseFloat(discount.toFixed(2))
                        
                                                                    //       }
                                                                    //   }
                        
                        
                                                                    // console.log("Ammount after discount= " + amount)
                                                                    var amount_is_tax = "exclusive";
                        
                                                                    if (amount_is_tax == "exclusive") {
                                                                        var amount = base
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
                                                                        total = total + amount;
                                                                    }
                                                                    // console.log("Ammount after Tax= " + amount)
                        
                                                                    // if (products[p].amount_is_tax == "inclusive") {
                                                                    //     var x = (100 + tax_info.rate) / 100;
                                                                    //     var tax_on_amount = amount / x;
                                                                    //     if (tax_rate.length > 0) {
                                                                    //         for (var r = 0; r < tax_rate.length; r++) {
                                                                    //             if (tax_rate[r].rate != tax_info.rate) {
                                                                    //                 var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                                    //                 base = base - t;
                                                                    //                 tax.push({
                                                                    //                     tax: tax_rate[r].tax,
                                                                    //                     rate: tax_rate[r].rate,
                                                                    //                     amount: parseFloat(t.toFixed(2))
                                                                    //                 });
                                                                    //             }
                                                                    //             else {
                                                                    //                 var t = amount - tax_on_amount;
                                                                    //                 base = base - t;
                                                                    //                 tax.push({
                                                                    //                     tax: tax_info.tax,
                                                                    //                     rate: tax_info.rate,
                                                                    //                     amount: parseFloat(t.toFixed(2))
                                                                    //                 });
                                                                    //             }
                                                                    //         }
                                                                    //     }
                                                                    //     total = total + amount;
                                                                    // }
                        
                                                                    var tax_details = {
                                                                        tax: tax_info.tax,
                                                                        rate: tax_info.rate,
                                                                        amount: total,
                                                                        // amount: amount,
                                                                        detail: tax
                                                                    }
                                                                    var lot = 1
                                                                    // console.log("Unit Base  Price  = " + (base / quantity))
                                                                    items.push({
                                                                        item_status: 'InComplete',
                                                                        product: null,
                                                                        part_no: products[p].part_no,
                                                                        hsn_sac: products[p].hsn_sac,
                                                                        part_category: products[p].part_category,    //OEM OR OES
                                                                        title: products[p].item,
                                                                        quantity: quantity,
                                                                        stock: quantity * lot,
                                                                        sku: products[p].sku,
                                                                        unit_base_price: base / quantity,
                                                                        unit_price: amount / quantity,
                                                                        unit: products[p].unit,
                                                                        lot: lot,
                                                                        mrp: products[p].mrp,
                                                                        rate: unit_base_price + products[p].margin,
                                                                        base: base,
                                                                        tax_amount: _.sumBy(tax, x => x.amount),
                                                                        amount: amount,
                                                                        models: products[p].models,
                                                                        amount_is_tax: amount_is_tax,
                                                                        sell_price: unit_base_price + products[p].margin,
                                                                        margin: products[p].margin,
                                                                        discount: discount,
                                                                        discount_type: products[p].discount_type,
                                                                        discount_total: products[p].discount_total,
                                                                        tax: tax_info.tax,
                                                                        tax_rate: tax_info.rate,
                                                                        tax_info: tax,
                                                                        isProduct: false,
                                                                        isOrderItem: true,
                        
                                                                    });
                        
                                                                    tax = [];
                                                                }
                                                            }
                                                            else {
                                                                res.status(422).json({
                                                                    responseCode: 422,
                                                                    responseMessage: "Please check tax",
                                                                    responseData: {}
                                                                });
                                                            }
                                                        }
                                                    }
                                                }
                        
                        
                                                var address = null;
                                                if (req.body.address) {
                                                    address = req.body.address;
                                                }
                                                var log_details = {
                                                    business: business,
                                                    activity_by: loggedInDetails.name,
                                                    activity: "Update",
                                                    remark: "Order To Bill Conversion",
                                                    created_at: new Date(),
                                                }
                                                var logs = []
                                                if (purchase.logs) {
                                                    logs = purchase.logs
                        
                                                } else {
                                                    logs.push(log_details)
                                                }
                                                var total = _.sumBy(items, x => x.amount);
                                                var discount_total = 0;
                                                var discount = 0
                                                var paid_total = total.toFixed(2)
                                                if (req.body.bill_discount > 0) {
                        
                                                    // console.log(" bILL Discount = " + req.body.bill_discount)
                                                    discount = parseFloat(req.body.bill_discount);
                                                    paid_total = total.toFixed(2)
                        
                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = total * (discount / 100);
                                                        paid_total = paid_total - parseFloat(discount_total.toFixed(2))
                                                    }
                        
                                                }
                                                var bill = {
                                                    due_date: due,
                                                    vendor: vendor._id,
                                                    items: items,
                                                    bill_discount: discount,
                                                    paid_total: paid_total,
                                                    total_discount: discount_total,
                                                    business: business,
                                                    total: paid_total,
                                                    subTotal: total.toFixed(2),
                                                    logs: logs,
                                                    // vendorOrder: vendorOrder._id,
                                                    updated_at: new Date(),
                                                };
                                                await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: bill }, { new: false }, async function (err, doc) {
                                                    if (err) {
                                                        res.status(422).json({
                                                            responseCode: 422,
                                                            responseMessage: "Server Error...",
                                                            responseData: err
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json({
                                                            responseCode: 200,
                                                            responseMessage: "Successfully Saved",
                                                            responseData: await Purchase.findById(req.body.bill).exec()
                                                        });
                                                    }
                                                });
                                            }
                                            else {
                                                res.status(400).json({
                                                    responseCode: 400,
                                                    responseMessage: "Items not found",
                                                    responseData: {}
                                                });
                                            }
                        */
                    }
                    else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Vendor not found",
                            responseData: {}
                        });
                    }
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Vendor Order not found",
                        responseData: {}
                    });
                }
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Send to seller Before Convert",
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
    }
});
router.post('/seller/order/convert/bill', xAccessToken.token, async function (req, res, next) {
    let reference_no = req.body.reference_no
    var rules = {
        bill: 'required',
    };
    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Bill is required",
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
        var loggedInDetails = await User.findById(decoded.user).exec();
        var product = new Object();
        var result = [];
        var tax = [];
        var total = 0;
        var purchase = await Purchase.findById(req.body.bill).exec();
        if (purchase) {
            // console.log("VendorOrder Id  = " + purchase.vendorOrder)
            var vendorOrder = await VendorOrders.findById(purchase.vendorOrder).exec();
            var order = await Order.findById(vendorOrder.order).exec();
            // console.log("Order  = " + order._id)
            // var count = await VendorOrders.findById(purchase.vendorOrder).count().exec();
            // console.log("VendorOrder Id  = " + vendorOrder._id + " Count = " + count)
            // return res.json(vendorOrder)
            if (order) {
                if (vendorOrder) {
                    if (req.body.due) {
                        var due = new Date(req.body.due).toISOString();
                    }
                    else {
                        var due = null
                    }
                    var vendor = await User.findById(vendorOrder.vendor).exec();
                    var newDate = new Date();
                    if (vendor) {
                        var items = [];
                        //
                        var salesItem = await OrderLine.find({ order: order._id }).exec();
                        console.log("Sales Length = " + salesItem.length)
                        if (salesItem.length > 0) {
                            // console.log("1057 products length = " + products.length)
                            for (var p = 0; p < salesItem.length; p++) {
                                if (salesItem[p].status == 'Confirmed') {
                                    if (salesItem[p].quantity != null) {
                                        // console.log("Come inside business product finding condition....")
                                        var product = await BusinessProduct.findOne({
                                            $or: [{
                                                part_no: salesItem[p].part_no
                                            }, { title: salesItem[p].title }],
                                            business: business
                                        }).exec();
                                        var tax_info = await Tax.findOne({ tax: salesItem[p].tax }).exec();
                                        if (tax_info) {
                                            var tax_rate = tax_info.detail;
                                            if (product) {
                                                // console.log("IF Is Product = " + product._id)
                                                var quantity = parseInt(salesItem[p].quantity);
                                                var unit_base_price = parseFloat(salesItem[p].rate);
                                                var base = parseFloat(salesItem[p].base);
                                                var amount_is_tax = salesItem[p].amount_is_tax


                                                var discount = salesItem[p].discount_total;
                                                // console.log("Discount prints here...", discount)
                                                /*  if (discount.indexOf("%") >= 0) {
                                                      // console.log("602 - Discount If Condition = " + discount)
                                                      discount = parseFloat(discount);
                                                      if (!isNaN(discount) && discount > 0) {
                                                          var discount_total = amount * (discount / 100);
                                                          amount = amount - parseFloat(discount_total.toFixed(2))
                        
                                                      }
                                                  }
                                                  else {
                                                      // console.log("610 - Discount ELSE Condition= " + discount)
                        
                        
                                                      discount = parseFloat(discount);
                                                      if (!isNaN(discount) && discount > 0) {
                                                          amount = amount - parseFloat(discount.toFixed(2))
                        
                                                      }
                                                  }
                        */

                                                // console.log("Ammount after discount= " + amount)
                                                var amount_is_tax = "exclusive";
                                                if (amount_is_tax == "exclusive") {
                                                    var amount = base
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
                                                    total = total + amount;
                                                }
                                                // console.log("Ammount after Tax= " + amount)


                                                // if (salesItem[p].amount_is_tax == "inclusive") {
                                                //     var x = (100 + tax_info.rate) / 100;
                                                //     var tax_on_amount = amount / x;
                                                //     if (tax_rate.length > 0) {
                                                //         for (var r = 0; r < tax_rate.length; r++) {
                                                //             if (tax_rate[r].rate != tax_info.rate) {
                                                //                 var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                //                 base = base - t;
                                                //                 tax.push({
                                                //                     tax: tax_rate[r].tax,
                                                //                     rate: tax_rate[r].rate,
                                                //                     amount: parseFloat(t.toFixed(2))
                                                //                 });
                                                //             }
                                                //             else {
                                                //                 var t = amount - tax_on_amount;
                                                //                 base = base - t;
                                                //                 tax.push({
                                                //                     tax: tax_info.tax,
                                                //                     rate: tax_info.rate,
                                                //                     amount: parseFloat(t.toFixed(2))
                                                //                 });
                                                //             }
                                                //         }
                                                //     }
                                                //     total = total + amount;
                                                // }

                                                var tax_details = {
                                                    tax: tax_info.tax,
                                                    rate: tax_info.rate,
                                                    amount: total,
                                                    // amount: amount,
                                                    detail: tax
                                                }

                                                // console.log("product.unit....", product.unit)
                                                // console.log("Product " + product.product)
                                                var lot = 1
                                                items.push({
                                                    item_status: 'InComplete',
                                                    product: product._id,
                                                    part_no: salesItem[p].part_no,
                                                    hsn_sac: product.hsn_sac,
                                                    part_category: product.part_category,    //OEM OR OES
                                                    // title: salesItem[p].item,
                                                    title: salesItem[p].title,
                                                    quantity: quantity,
                                                    stock: quantity * lot,
                                                    sku: product.sku,
                                                    unit_base_price: salesItem[p].rate,
                                                    unit_price: amount / quantity,
                                                    // purchase_price: purchase_price,
                                                    unit: salesItem[p].unit,
                                                    lot: lot,
                                                    mrp: salesItem[p].mrp,
                                                    rate: salesItem[p].rate,
                                                    base: base,
                                                    tax_amount: _.sumBy(tax, x => x.amount),
                                                    // tax_amount: tax_amount,
                                                    amount: amount,
                                                    // models: salesItem[p].models,
                                                    amount_is_tax: amount_is_tax,
                                                    sell_price: salesItem[p].rate,
                                                    margin: 0,
                                                    discount: salesItem[p].discount,
                                                    discount_type: '',
                                                    discount_total: salesItem[p].discount_total,
                                                    tax: tax_info.tax,
                                                    tax_rate: tax_info.rate,
                                                    tax_info: tax,
                                                    isProduct: true,
                                                    isOrderItem: true,
                                                });

                                                tax = [];
                                            }
                                            else {
                                                // console.log("ELSE Is Product ???")
                                                var quantity = parseInt(salesItem[p].quantity);
                                                var unit_base_price = parseFloat(salesItem[p].unit_base_price);
                                                var base = parseFloat(salesItem[p].base);
                                                var amount_is_tax = salesItem[p].amount_is_tax
                                                var discount = salesItem[p].discount;
                                                // console.log("Discount prints here...", discount)
                                                /*  if (discount.indexOf("%") >= 0) {
                                                      // console.log("602 - Discount If Condition = " + discount)
                                                      discount = parseFloat(discount);
                                                      if (!isNaN(discount) && discount > 0) {
                                                          var discount_total = amount * (discount / 100);
                                                          amount = amount - parseFloat(discount_total.toFixed(2))
                        
                                                      }
                                                  }
                                                  else {
                                                      // console.log("610 - Discount ELSE Condition= " + discount)
                        
                        
                                                      discount = parseFloat(discount);
                                                      if (!isNaN(discount) && discount > 0) {
                                                          amount = amount - parseFloat(discount.toFixed(2))
                        
                                                      }
                                                  }
                        */

                                                // console.log("Ammount after discount= " + amount)
                                                var amount_is_tax = "exclusive";

                                                if (amount_is_tax == "exclusive") {
                                                    var amount = base
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
                                                    total = total + amount;
                                                }
                                                // console.log("Ammount after Tax= " + amount)

                                                // if (salesItem[p].amount_is_tax == "inclusive") {
                                                //     var x = (100 + tax_info.rate) / 100;
                                                //     var tax_on_amount = amount / x;
                                                //     if (tax_rate.length > 0) {
                                                //         for (var r = 0; r < tax_rate.length; r++) {
                                                //             if (tax_rate[r].rate != tax_info.rate) {
                                                //                 var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                //                 base = base - t;
                                                //                 tax.push({
                                                //                     tax: tax_rate[r].tax,
                                                //                     rate: tax_rate[r].rate,
                                                //                     amount: parseFloat(t.toFixed(2))
                                                //                 });
                                                //             }
                                                //             else {
                                                //                 var t = amount - tax_on_amount;
                                                //                 base = base - t;
                                                //                 tax.push({
                                                //                     tax: tax_info.tax,
                                                //                     rate: tax_info.rate,
                                                //                     amount: parseFloat(t.toFixed(2))
                                                //                 });
                                                //             }
                                                //         }
                                                //     }
                                                //     total = total + amount;
                                                // }

                                                var tax_details = {
                                                    tax: tax_info.tax,
                                                    rate: tax_info.rate,
                                                    amount: total,
                                                    // amount: amount,
                                                    detail: tax
                                                }
                                                var lot = 1
                                                // console.log("Unit Base  Price  = " + (base / quantity))
                                                items.push({
                                                    item_status: 'InComplete',
                                                    product: null,
                                                    part_no: salesItem[p].part_no,
                                                    hsn_sac: salesItem[p].hsn_sac,
                                                    part_category: salesItem[p].part_category,    //OEM OR OES
                                                    title: salesItem[p].title,
                                                    quantity: quantity,
                                                    stock: quantity * lot,
                                                    // sku: salesItem[p].sku,
                                                    unit_base_price: base / quantity,
                                                    unit_price: amount / quantity,
                                                    unit: salesItem[p].unit,
                                                    lot: lot,
                                                    mrp: salesItem[p].mrp,
                                                    rate: salesItem[p].rate,
                                                    base: base,
                                                    tax_amount: _.sumBy(tax, x => x.amount),
                                                    amount: amount,
                                                    models: [],
                                                    amount_is_tax: amount_is_tax,
                                                    sell_price: salesItem[p].rate,
                                                    margin: 0,
                                                    discount: discount,
                                                    discount_type: '',
                                                    discount_total: salesItem[p].discount_total,
                                                    tax: tax_info.tax,
                                                    tax_rate: tax_info.rate,
                                                    tax_info: tax,
                                                    isProduct: false,
                                                    isOrderItem: true,

                                                });

                                                tax = [];
                                            }
                                        }
                                        else {
                                            res.status(422).json({
                                                responseCode: 422,
                                                responseMessage: "Please check tax",
                                                responseData: {}
                                            });
                                        }
                                    }
                                }
                            }


                            var address = null;
                            if (req.body.address) {
                                address = req.body.address;
                            }
                            var log_details = {
                                business: business,
                                activity_by: loggedInDetails.name,
                                activity: "Update",
                                remark: "Order To Bill Conversion",
                                created_at: new Date(),
                            }
                            var logs = []
                            if (purchase.logs) {
                                logs = purchase.logs

                            } else {
                                logs.push(log_details)
                            }
                            var total = _.sumBy(items, x => x.amount);
                            var discount_total = 0;
                            var discount = 0
                            var paid_total = total.toFixed(2)
                            if (req.body.bill_discount > 0) {

                                // console.log(" bILL Discount = " + req.body.bill_discount)
                                discount = parseFloat(req.body.bill_discount);
                                paid_total = total.toFixed(2)

                                if (!isNaN(discount) && discount > 0) {
                                    discount_total = total * (discount / 100);
                                    paid_total = paid_total - parseFloat(discount_total.toFixed(2))
                                }

                            }
                            var bill = {
                                due_date: due,
                                vendor: vendor._id,
                                items: items,
                                bill_discount: discount,
                                paid_total: paid_total,
                                total_discount: discount_total,
                                business: business,
                                total: paid_total,
                                subTotal: total.toFixed(2),
                                logs: logs,
                                // vendorOrder: vendorOrder._id,
                                updated_at: new Date(),
                            };
                            await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: bill }, { new: false }, async function (err, doc) {
                                if (err) {
                                    res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "Server Error...",
                                        responseData: err
                                    });
                                }
                                else {
                                    res.status(200).json({
                                        responseCode: 200,
                                        responseMessage: "Successfully Saved",
                                        responseData: await Purchase.findById(req.body.bill).exec()
                                    });
                                }
                            });
                        }
                        ///
                        /*
                                            var products = vendorOrder.parts;
                                            if (products.length > 0) {
                                                // console.log("1057 products length = " + products.length)
                                                for (var p = 0; p < products.length; p++) {
                                                    if (products[p].status == 'confirmed') {
                                                        if (products[p].quantity != null) {
                                                            // console.log("Come inside business product finding condition....")
                                                            var product = await BusinessProduct.findOne({
                                                                $or: [{
                                                                    part_no: products[p].part_no
                                                                }, { title: products[p].title }],
                                                                business: business
                                                            }).exec();
                                                            var tax_info = await Tax.findOne({ tax: products[p].tax }).exec();
                                                            if (tax_info) {
                                                                var tax_rate = tax_info.detail;
                                                                if (product) {
                                                                    // console.log("IF Is Product = " + product._id)
                                                                    var quantity = parseInt(products[p].quantity);
                                                                    var unit_base_price = parseFloat(products[p].unit_base_price);
                                                                    var base = parseFloat(products[p].unit_base_price) * quantity;
                                                                    var amount_is_tax = products[p].amount_is_tax
                        
                        
                                                                    var discount = products[p].discount;
                                                                    // console.log("Discount prints here...", discount)
                                                                    //   if (discount.indexOf("%") >= 0) {
                                                                    //       // console.log("602 - Discount If Condition = " + discount)
                                                                    //       discount = parseFloat(discount);
                                                                    //       if (!isNaN(discount) && discount > 0) {
                                                                    //           var discount_total = amount * (discount / 100);
                                                                    //           amount = amount - parseFloat(discount_total.toFixed(2))
                        
                                                                    //       }
                                                                    //   }
                                                                    //   else {
                                                                    //       // console.log("610 - Discount ELSE Condition= " + discount)
                        
                        
                                                                    //       discount = parseFloat(discount);
                                                                    //       if (!isNaN(discount) && discount > 0) {
                                                                    //           amount = amount - parseFloat(discount.toFixed(2))
                        
                                                                    //       }
                                                                    //   }
                        
                        
                                                                    // console.log("Ammount after discount= " + amount)
                                                                    var amount_is_tax = "exclusive";
                                                                    if (amount_is_tax == "exclusive") {
                                                                        var amount = base
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
                                                                        total = total + amount;
                                                                    }
                                                                    // console.log("Ammount after Tax= " + amount)
                        
                        
                                                                    // if (products[p].amount_is_tax == "inclusive") {
                                                                    //     var x = (100 + tax_info.rate) / 100;
                                                                    //     var tax_on_amount = amount / x;
                                                                    //     if (tax_rate.length > 0) {
                                                                    //         for (var r = 0; r < tax_rate.length; r++) {
                                                                    //             if (tax_rate[r].rate != tax_info.rate) {
                                                                    //                 var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                                    //                 base = base - t;
                                                                    //                 tax.push({
                                                                    //                     tax: tax_rate[r].tax,
                                                                    //                     rate: tax_rate[r].rate,
                                                                    //                     amount: parseFloat(t.toFixed(2))
                                                                    //                 });
                                                                    //             }
                                                                    //             else {
                                                                    //                 var t = amount - tax_on_amount;
                                                                    //                 base = base - t;
                                                                    //                 tax.push({
                                                                    //                     tax: tax_info.tax,
                                                                    //                     rate: tax_info.rate,
                                                                    //                     amount: parseFloat(t.toFixed(2))
                                                                    //                 });
                                                                    //             }
                                                                    //         }
                                                                    //     }
                                                                    //     total = total + amount;
                                                                    // }
                        
                                                                    var tax_details = {
                                                                        tax: tax_info.tax,
                                                                        rate: tax_info.rate,
                                                                        amount: total,
                                                                        // amount: amount,
                                                                        detail: tax
                                                                    }
                        
                                                                    // console.log("product.unit....", product.unit)
                                                                    // console.log("Product " + product.product)
                                                                    var lot = 1
                                                                    items.push({
                                                                        item_status: 'InComplete',
                                                                        product: product._id,
                                                                        part_no: products[p].part_no,
                                                                        hsn_sac: product.hsn_sac,
                                                                        part_category: product.part_category,    //OEM OR OES
                                                                        title: products[p].item,
                                                                        quantity: quantity,
                                                                        stock: quantity * lot,
                                                                        sku: product.sku,
                                                                        unit_base_price: products[p].unit_base_price,
                                                                        unit_price: amount / quantity,
                                                                        // purchase_price: purchase_price,
                                                                        unit: product.unit,
                                                                        lot: lot,
                                                                        mrp: products[p].mrp,
                                                                        rate: unit_base_price + products[p].margin,
                                                                        base: base,
                                                                        tax_amount: _.sumBy(tax, x => x.amount),
                                                                        // tax_amount: tax_amount,
                                                                        amount: amount,
                                                                        models: products[p].models,
                                                                        amount_is_tax: amount_is_tax,
                                                                        sell_price: unit_base_price + products[p].margin,
                                                                        margin: products[p].margin,
                                                                        discount: discount,
                                                                        discount_type: products[p].discount_type,
                                                                        discount_total: products[p].discount_total,
                                                                        tax: tax_info.tax,
                                                                        tax_rate: tax_info.rate,
                                                                        tax_info: tax,
                                                                        isProduct: true,
                                                                        isOrderItem: true,
                                                                    });
                        
                                                                    tax = [];
                                                                }
                                                                else {
                                                                    // console.log("ELSE Is Product ???")
                                                                    var quantity = parseInt(products[p].quantity);
                                                                    var unit_base_price = parseFloat(products[p].unit_base_price);
                                                                    var base = parseFloat(products[p].unit_base_price) * quantity;
                                                                    var amount_is_tax = products[p].amount_is_tax
                                                                    var discount = products[p].discount;
                                                                    // console.log("Discount prints here...", discount)
                                                                    //   if (discount.indexOf("%") >= 0) {
                                                                    //       // console.log("602 - Discount If Condition = " + discount)
                                                                    //       discount = parseFloat(discount);
                                                                    //       if (!isNaN(discount) && discount > 0) {
                                                                    //           var discount_total = amount * (discount / 100);
                                                                    //           amount = amount - parseFloat(discount_total.toFixed(2))
                        
                                                                    //       }
                                                                    //   }
                                                                    //   else {
                                                                    //       // console.log("610 - Discount ELSE Condition= " + discount)
                        
                        
                                                                    //       discount = parseFloat(discount);
                                                                    //       if (!isNaN(discount) && discount > 0) {
                                                                    //           amount = amount - parseFloat(discount.toFixed(2))
                        
                                                                    //       }
                                                                    //   }
                        
                        
                                                                    // console.log("Ammount after discount= " + amount)
                                                                    var amount_is_tax = "exclusive";
                        
                                                                    if (amount_is_tax == "exclusive") {
                                                                        var amount = base
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
                                                                        total = total + amount;
                                                                    }
                                                                    // console.log("Ammount after Tax= " + amount)
                        
                                                                    // if (products[p].amount_is_tax == "inclusive") {
                                                                    //     var x = (100 + tax_info.rate) / 100;
                                                                    //     var tax_on_amount = amount / x;
                                                                    //     if (tax_rate.length > 0) {
                                                                    //         for (var r = 0; r < tax_rate.length; r++) {
                                                                    //             if (tax_rate[r].rate != tax_info.rate) {
                                                                    //                 var t = tax_on_amount * (tax_rate[r].rate / 100);
                                                                    //                 base = base - t;
                                                                    //                 tax.push({
                                                                    //                     tax: tax_rate[r].tax,
                                                                    //                     rate: tax_rate[r].rate,
                                                                    //                     amount: parseFloat(t.toFixed(2))
                                                                    //                 });
                                                                    //             }
                                                                    //             else {
                                                                    //                 var t = amount - tax_on_amount;
                                                                    //                 base = base - t;
                                                                    //                 tax.push({
                                                                    //                     tax: tax_info.tax,
                                                                    //                     rate: tax_info.rate,
                                                                    //                     amount: parseFloat(t.toFixed(2))
                                                                    //                 });
                                                                    //             }
                                                                    //         }
                                                                    //     }
                                                                    //     total = total + amount;
                                                                    // }
                        
                                                                    var tax_details = {
                                                                        tax: tax_info.tax,
                                                                        rate: tax_info.rate,
                                                                        amount: total,
                                                                        // amount: amount,
                                                                        detail: tax
                                                                    }
                                                                    var lot = 1
                                                                    // console.log("Unit Base  Price  = " + (base / quantity))
                                                                    items.push({
                                                                        item_status: 'InComplete',
                                                                        product: null,
                                                                        part_no: products[p].part_no,
                                                                        hsn_sac: products[p].hsn_sac,
                                                                        part_category: products[p].part_category,    //OEM OR OES
                                                                        title: products[p].item,
                                                                        quantity: quantity,
                                                                        stock: quantity * lot,
                                                                        sku: products[p].sku,
                                                                        unit_base_price: base / quantity,
                                                                        unit_price: amount / quantity,
                                                                        unit: products[p].unit,
                                                                        lot: lot,
                                                                        mrp: products[p].mrp,
                                                                        rate: unit_base_price + products[p].margin,
                                                                        base: base,
                                                                        tax_amount: _.sumBy(tax, x => x.amount),
                                                                        amount: amount,
                                                                        models: products[p].models,
                                                                        amount_is_tax: amount_is_tax,
                                                                        sell_price: unit_base_price + products[p].margin,
                                                                        margin: products[p].margin,
                                                                        discount: discount,
                                                                        discount_type: products[p].discount_type,
                                                                        discount_total: products[p].discount_total,
                                                                        tax: tax_info.tax,
                                                                        tax_rate: tax_info.rate,
                                                                        tax_info: tax,
                                                                        isProduct: false,
                                                                        isOrderItem: true,
                        
                                                                    });
                        
                                                                    tax = [];
                                                                }
                                                            }
                                                            else {
                                                                res.status(422).json({
                                                                    responseCode: 422,
                                                                    responseMessage: "Please check tax",
                                                                    responseData: {}
                                                                });
                                                            }
                                                        }
                                                    }
                                                }
                        
                        
                                                var address = null;
                                                if (req.body.address) {
                                                    address = req.body.address;
                                                }
                                                var log_details = {
                                                    business: business,
                                                    activity_by: loggedInDetails.name,
                                                    activity: "Update",
                                                    remark: "Order To Bill Conversion",
                                                    created_at: new Date(),
                                                }
                                                var logs = []
                                                if (purchase.logs) {
                                                    logs = purchase.logs
                        
                                                } else {
                                                    logs.push(log_details)
                                                }
                                                var total = _.sumBy(items, x => x.amount);
                                                var discount_total = 0;
                                                var discount = 0
                                                var paid_total = total.toFixed(2)
                                                if (req.body.bill_discount > 0) {
                        
                                                    // console.log(" bILL Discount = " + req.body.bill_discount)
                                                    discount = parseFloat(req.body.bill_discount);
                                                    paid_total = total.toFixed(2)
                        
                                                    if (!isNaN(discount) && discount > 0) {
                                                        discount_total = total * (discount / 100);
                                                        paid_total = paid_total - parseFloat(discount_total.toFixed(2))
                                                    }
                        
                                                }
                                                var bill = {
                                                    due_date: due,
                                                    vendor: vendor._id,
                                                    items: items,
                                                    bill_discount: discount,
                                                    paid_total: paid_total,
                                                    total_discount: discount_total,
                                                    business: business,
                                                    total: paid_total,
                                                    subTotal: total.toFixed(2),
                                                    logs: logs,
                                                    // vendorOrder: vendorOrder._id,
                                                    updated_at: new Date(),
                                                };
                                                await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: bill }, { new: false }, async function (err, doc) {
                                                    if (err) {
                                                        res.status(422).json({
                                                            responseCode: 422,
                                                            responseMessage: "Server Error...",
                                                            responseData: err
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json({
                                                            responseCode: 200,
                                                            responseMessage: "Successfully Saved",
                                                            responseData: await Purchase.findById(req.body.bill).exec()
                                                        });
                                                    }
                                                });
                                            }
                                            else {
                                                res.status(400).json({
                                                    responseCode: 400,
                                                    responseMessage: "Items not found",
                                                    responseData: {}
                                                });
                                            }
                        */
                    }
                    else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Vendor not found",
                            responseData: {}
                        });
                    }
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Vendor Order not found",
                        responseData: {}
                    });
                }
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Send to seller Before Convert",
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
    }
});
router.post('/purchaser/order/convert/bill/', xAccessToken.token, async function (req, res, next) {
    let reference_no = req.body.reference_no
    var rules = {
        bill: 'required',
    };
    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Bill is required",
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
        var loggedInDetails = await User.findById(decoded.user).exec();
        var product = new Object();
        var result = [];
        var tax = [];
        var total = 0;
        var purchase = await Purchase.findById(req.body.bill).exec();
        if (purchase) {
            // console.log("VendorOrder Id  = " + purchase.vendorOrder)
            var vendorOrder = await VendorOrders.findById(purchase.vendorOrder).exec();
            // var count = await VendorOrders.findById(purchase.vendorOrder).count().exec();
            // console.log("VendorOrder Id  = " + vendorOrder._id + " Count = " + count)
            // return res.json(vendorOrder)
            if (vendorOrder) {
                if (req.body.due) {
                    var due = new Date(req.body.due).toISOString();
                }
                else {
                    var due = null
                }
                var vendor = await User.findById(vendorOrder.vendor).exec();
                var newDate = new Date();
                if (vendor) {
                    var items = [];
                    var products = vendorOrder.parts;
                    if (products.length > 0) {
                        // console.log("1057 products length = " + products.length)
                        for (var p = 0; p < products.length; p++) {
                            if (products[p].status == 'confirmed') {
                                if (products[p].quantity != null) {
                                    // console.log("Come inside business product finding condition....")
                                    var product = await BusinessProduct.findOne({
                                        $or: [{
                                            part_no: products[p].part_no
                                        }, { title: products[p].title }],
                                        business: business
                                    }).exec();
                                    var tax_info = await Tax.findOne({ tax: products[p].tax }).exec();
                                    if (tax_info) {
                                        var tax_rate = tax_info.detail;
                                        if (product) {
                                            // console.log("IF Is Product = " + product._id)
                                            var quantity = parseInt(products[p].quantity);
                                            var unit_base_price = parseFloat(products[p].unit_base_price);
                                            var base = parseFloat(products[p].unit_base_price) * quantity;
                                            var amount_is_tax = products[p].amount_is_tax


                                            var discount = products[p].discount;
                                            // console.log("Discount prints here...", discount)
                                            /*  if (discount.indexOf("%") >= 0) {
                                                  // console.log("602 - Discount If Condition = " + discount)
                                                  discount = parseFloat(discount);
                                                  if (!isNaN(discount) && discount > 0) {
                                                      var discount_total = amount * (discount / 100);
                                                      amount = amount - parseFloat(discount_total.toFixed(2))
          
                                                  }
                                              }
                                              else {
                                                  // console.log("610 - Discount ELSE Condition= " + discount)
          
          
                                                  discount = parseFloat(discount);
                                                  if (!isNaN(discount) && discount > 0) {
                                                      amount = amount - parseFloat(discount.toFixed(2))
          
                                                  }
                                              }
          */

                                            // console.log("Ammount after discount= " + amount)
                                            var amount_is_tax = "exclusive";
                                            if (amount_is_tax == "exclusive") {
                                                var amount = base
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
                                                total = total + amount;
                                            }
                                            // console.log("Ammount after Tax= " + amount)


                                            // if (products[p].amount_is_tax == "inclusive") {
                                            //     var x = (100 + tax_info.rate) / 100;
                                            //     var tax_on_amount = amount / x;
                                            //     if (tax_rate.length > 0) {
                                            //         for (var r = 0; r < tax_rate.length; r++) {
                                            //             if (tax_rate[r].rate != tax_info.rate) {
                                            //                 var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            //                 base = base - t;
                                            //                 tax.push({
                                            //                     tax: tax_rate[r].tax,
                                            //                     rate: tax_rate[r].rate,
                                            //                     amount: parseFloat(t.toFixed(2))
                                            //                 });
                                            //             }
                                            //             else {
                                            //                 var t = amount - tax_on_amount;
                                            //                 base = base - t;
                                            //                 tax.push({
                                            //                     tax: tax_info.tax,
                                            //                     rate: tax_info.rate,
                                            //                     amount: parseFloat(t.toFixed(2))
                                            //                 });
                                            //             }
                                            //         }
                                            //     }
                                            //     total = total + amount;
                                            // }

                                            var tax_details = {
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: total,
                                                // amount: amount,
                                                detail: tax
                                            }

                                            // console.log("product.unit....", product.unit)
                                            // console.log("Product " + product.product)
                                            var lot = 1
                                            items.push({
                                                item_status: 'InComplete',
                                                product: product._id,
                                                part_no: products[p].part_no,
                                                hsn_sac: product.hsn_sac,
                                                part_category: product.part_category,    //OEM OR OES
                                                title: products[p].item,
                                                quantity: quantity,
                                                stock: quantity * lot,
                                                sku: product.sku,
                                                unit_base_price: products[p].unit_base_price,
                                                unit_price: amount / quantity,
                                                // purchase_price: purchase_price,
                                                unit: product.unit,
                                                lot: lot,
                                                mrp: products[p].mrp,
                                                rate: unit_base_price + products[p].margin,
                                                base: base,
                                                tax_amount: _.sumBy(tax, x => x.amount),
                                                // tax_amount: tax_amount,
                                                amount: amount,
                                                models: products[p].models,
                                                amount_is_tax: amount_is_tax,
                                                sell_price: unit_base_price + products[p].margin,
                                                margin: products[p].margin,
                                                discount: discount,
                                                discount_type: products[p].discount_type,
                                                discount_total: products[p].discount_total,
                                                tax: tax_info.tax,
                                                tax_rate: tax_info.rate,
                                                tax_info: tax,
                                                isProduct: true,
                                                isOrderItem: true,
                                            });

                                            tax = [];
                                        }
                                        else {
                                            // console.log("ELSE Is Product ???")
                                            var quantity = parseInt(products[p].quantity);
                                            var unit_base_price = parseFloat(products[p].unit_base_price);
                                            var base = parseFloat(products[p].unit_base_price) * quantity;
                                            var amount_is_tax = products[p].amount_is_tax
                                            var discount = products[p].discount;
                                            // console.log("Discount prints here...", discount)
                                            /*  if (discount.indexOf("%") >= 0) {
                                                  // console.log("602 - Discount If Condition = " + discount)
                                                  discount = parseFloat(discount);
                                                  if (!isNaN(discount) && discount > 0) {
                                                      var discount_total = amount * (discount / 100);
                                                      amount = amount - parseFloat(discount_total.toFixed(2))
          
                                                  }
                                              }
                                              else {
                                                  // console.log("610 - Discount ELSE Condition= " + discount)
          
          
                                                  discount = parseFloat(discount);
                                                  if (!isNaN(discount) && discount > 0) {
                                                      amount = amount - parseFloat(discount.toFixed(2))
          
                                                  }
                                              }
          */

                                            // console.log("Ammount after discount= " + amount)
                                            var amount_is_tax = "exclusive";

                                            if (amount_is_tax == "exclusive") {
                                                var amount = base
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
                                                total = total + amount;
                                            }
                                            // console.log("Ammount after Tax= " + amount)

                                            // if (products[p].amount_is_tax == "inclusive") {
                                            //     var x = (100 + tax_info.rate) / 100;
                                            //     var tax_on_amount = amount / x;
                                            //     if (tax_rate.length > 0) {
                                            //         for (var r = 0; r < tax_rate.length; r++) {
                                            //             if (tax_rate[r].rate != tax_info.rate) {
                                            //                 var t = tax_on_amount * (tax_rate[r].rate / 100);
                                            //                 base = base - t;
                                            //                 tax.push({
                                            //                     tax: tax_rate[r].tax,
                                            //                     rate: tax_rate[r].rate,
                                            //                     amount: parseFloat(t.toFixed(2))
                                            //                 });
                                            //             }
                                            //             else {
                                            //                 var t = amount - tax_on_amount;
                                            //                 base = base - t;
                                            //                 tax.push({
                                            //                     tax: tax_info.tax,
                                            //                     rate: tax_info.rate,
                                            //                     amount: parseFloat(t.toFixed(2))
                                            //                 });
                                            //             }
                                            //         }
                                            //     }
                                            //     total = total + amount;
                                            // }

                                            var tax_details = {
                                                tax: tax_info.tax,
                                                rate: tax_info.rate,
                                                amount: total,
                                                // amount: amount,
                                                detail: tax
                                            }
                                            var lot = 1
                                            // console.log("Unit Base  Price  = " + (base / quantity))
                                            items.push({
                                                item_status: 'InComplete',
                                                product: null,
                                                part_no: products[p].part_no,
                                                hsn_sac: products[p].hsn_sac,
                                                part_category: products[p].part_category,    //OEM OR OES
                                                title: products[p].item,
                                                quantity: quantity,
                                                stock: quantity * lot,
                                                sku: products[p].sku,
                                                unit_base_price: base / quantity,
                                                unit_price: amount / quantity,
                                                unit: products[p].unit,
                                                lot: lot,
                                                mrp: products[p].mrp,
                                                rate: unit_base_price + products[p].margin,
                                                base: base,
                                                tax_amount: _.sumBy(tax, x => x.amount),
                                                amount: amount,
                                                models: products[p].models,
                                                amount_is_tax: amount_is_tax,
                                                sell_price: unit_base_price + products[p].margin,
                                                margin: products[p].margin,
                                                discount: discount,
                                                discount_type: products[p].discount_type,
                                                discount_total: products[p].discount_total,
                                                tax: tax_info.tax,
                                                tax_rate: tax_info.rate,
                                                tax_info: tax,
                                                isProduct: false,
                                                isOrderItem: true,

                                            });

                                            tax = [];
                                        }
                                    }
                                    else {
                                        res.status(422).json({
                                            responseCode: 422,
                                            responseMessage: "Please check tax",
                                            responseData: {}
                                        });
                                    }
                                }
                            }
                        }


                        var address = null;
                        if (req.body.address) {
                            address = req.body.address;
                        }
                        var log_details = {
                            business: business,
                            activity_by: loggedInDetails.name,
                            activity: "Update",
                            remark: "Order To Bill Conversion",
                            created_at: new Date(),
                        }
                        var logs = []
                        if (purchase.logs) {
                            logs = purchase.logs

                        } else {
                            logs.push(log_details)
                        }
                        var total = _.sumBy(items, x => x.amount);
                        var discount_total = 0;
                        var discount = 0
                        var paid_total = total.toFixed(2)
                        if (req.body.bill_discount > 0) {

                            // console.log(" bILL Discount = " + req.body.bill_discount)
                            discount = parseFloat(req.body.bill_discount);
                            paid_total = total.toFixed(2)

                            if (!isNaN(discount) && discount > 0) {
                                discount_total = total * (discount / 100);
                                paid_total = paid_total - parseFloat(discount_total.toFixed(2))
                            }

                        }
                        var bill = {
                            due_date: due,
                            vendor: vendor._id,
                            items: items,
                            bill_discount: discount,
                            paid_total: paid_total,
                            total_discount: discount_total,
                            business: business,
                            total: paid_total,
                            subTotal: total.toFixed(2),
                            logs: logs,
                            // vendorOrder: vendorOrder._id,
                            updated_at: new Date(),
                        };
                        await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: bill }, { new: false }, async function (err, doc) {
                            if (err) {
                                res.status(422).json({
                                    responseCode: 422,
                                    responseMessage: "Server Error...",
                                    responseData: err
                                });
                            }
                            else {
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "Successfully Saved",
                                    responseData: await Purchase.findById(req.body.bill).exec()
                                });
                            }
                        });
                    }
                    else {
                        res.status(400).json({
                            responseCode: 400,
                            responseMessage: "Items not found",
                            responseData: {}
                        });
                    }
                }
                else {
                    res.status(400).json({
                        responseCode: 400,
                        responseMessage: "Vendor not found",
                        responseData: {}
                    });
                }
            }
            else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Vendor Order not found",
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
    }
});
router.put('/vendorOrder/item/remove', async (req, res, next) => {
    businessFunctions.logs("INFO: /vendorOrder/item/remove Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var order = req.body.order;
    var partIndex = req.body.index;
    var item = req.body.item;
    // console.log("order = ", order)
    // console.log("quotationId", partIndex)
    var loggedInDetails = await User.findById(user).exec();
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Vendor Order details for the orderId:" + req.body.order + ", User:" + loggedInDetails.name);
    }
    var vendorOrder = await VendorOrders.findOne({ _id: order }).exec();
    if (vendorOrder) {
        var activity = {
            business: business,
            activity_by: loggedInDetails.name,
            activity: "Title: ' " + vendorOrder.parts[partIndex].item + " ' , Qty: " + vendorOrder.parts[partIndex].quantity + " , Amt: " + vendorOrder.parts[partIndex].amount + " ( Removed )  ",
            remark: "New Part Added",
            created_at: new Date(),
        }
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Removing Item from the Vendor Order for the orderId:" + req.body.order + ", Item:" + vendorOrder.parts[partIndex].item + ", User:" + loggedInDetails.name);
        }
        vendorOrder.parts.splice(partIndex, 1)
        vendorOrder.markModified('parts')
        await vendorOrder.save()
        businessFunctions.vendorOrderLogs(vendorOrder._id, activity);
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Removed Successfully",
            responseData: {}
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Item Removed from the vendor order Successfully, Item:" + vendorOrder.parts[partIndex].item + ", User:" + loggedInDetails.name);
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Order not found for the orderId:" + req.body.order + ", User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order Not Found",
            responseData: {}
        });
    }

})
// vendorOrder/item/edit
router.put('/vendorOrder/item/edit', async (req, res, next) => {
    businessFunctions.logs("INFO: /vendorOrder/item/edit Api Called from vendorOrder.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var order = req.body.order;
    var index = req.body.index;
    var part = req.body.item;
    var tax = [];
    var total = 0
    // console.log("order = ", order)
    // console.log("quotationId", index)
    var loggedInDetails = await User.findById(user).exec();
    var vendorOrder = await VendorOrders.findOne({ _id: order }).exec();
    if (vendorOrder) {
        if (part) {
            if (part.quantity != null) {
                var tax_info = await Tax.findOne({ tax: part.tax }).exec();
                if (tax_info) {
                    // console.log("Product ")
                    var tax_rate = tax_info.detail;
                    var base = parseFloat(part.unit_base_price) * parseFloat(part.quantity);
                    // console.log("Base  = " + unit_base_price)
                    var discount = part.discount;
                    var amount = parseFloat(part.unit_base_price) * parseFloat(part.quantity);
                    var discount_total = 0;
                    // if (discount.indexOf("%") >= 0) {
                    //     discount = parseFloat(discount);
                    //     if (!isNaN(discount) && discount > 0) {
                    //         var discount_total = amount * (discount / 100);
                    //         amount = amount - parseFloat(discount_total.toFixed(2))
                    //     }
                    // }
                    // else {
                    //     discount = parseFloat(discount);
                    //     if (!isNaN(discount) && discount > 0) {
                    //         base = base - parseFloat(discount.toFixed(2))
                    //     }
                    // }
                    if (part.amount_is_tax == "exclusive") {
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                            businessFunctions.logs("DEBUG: Calculate Tax amount for Exclusive Tax.");
                        }
                        var tax_on_amount = amount;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                                    amount = amount + t;
                                    // console.log("Tax AMO=" + t)
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                                else {
                                    var t = tax_on_amount * (tax_info.rate / 100);
                                    amount = amount + t;
                                    // console.log("Tax AMO=" + t)

                                    tax.push({
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                            }
                        }
                        total = total + amount;

                        // console.log("Amount  = " + amount)
                    }

                    if (part.amount_is_tax == "inclusive") {
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
                        total = total + amount;
                    }

                    var tax_details = {
                        tax: tax_info.tax,
                        rate: tax_info.rate,
                        amount: total.toFixed(2),
                        detail: tax
                    }
                    vendorOrder.parts[index].part_no = part.part_no;
                    vendorOrder.parts[index].item = part.title;
                    vendorOrder.parts[index].quantity = part.quantity;
                    vendorOrder.parts[index].stock = part.quantity * part.lot;
                    vendorOrder.parts[index].mrp = parseFloat(part.unit_price)
                    vendorOrder.parts[index].amount = amount.toFixed(2);
                    vendorOrder.parts[index].base = base.toFixed(2);
                    vendorOrder.parts[index].unit_base_price = parseFloat(part.unit_base_price);
                    vendorOrder.parts[index].tax_amount = _.sumBy(tax, x => x.amount);
                    vendorOrder.parts[index].unit_price = (amount / parseFloat(part.quantity)).toFixed(2);
                    vendorOrder.parts[index].amount_is_tax = part.amount_is_tax;
                    vendorOrder.parts[index].margin = parseFloat(part.margin);
                    vendorOrder.parts[index].sell_price = parseFloat(part.unit_base_price) + parseFloat(part.margin);
                    vendorOrder.parts[index].rate = parseFloat(part.unit_base_price) + parseFloat(part.margin);
                    vendorOrder.parts[index].tax = tax_info.tax;
                    vendorOrder.parts[index].tax_rate = tax_info.rate;
                    vendorOrder.parts[index].tax_info = tax;
                    // }
                    vendorOrder.markModified('parts')
                    vendorOrder.save()

                } else {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Please check tax",
                        responseData: {}
                    });
                }

            } else {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Invalid Quantity, Tax Type , Base Amount " + part.item,
                    responseData: {}
                });
            }
            var total_amount = _.sumBy(vendorOrder.parts, x => x.amount);
            await VendorOrders.findOneAndUpdate({ _id: vendorOrder._id }, { $set: { total_amount: total_amount, updated_at: new Date, } }, { new: true }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Server Error occured while updating the part details, VendorOrderId:" + vendorOrder._id + ", User:" + loggedInDetails.name);
                    }
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error...",
                        responseData: err
                    });
                }
                else {

                    var activity = {
                        business: business,
                        activity_by: loggedInDetails.name,
                        activity: "Title: ' " + part.title + " ' , Qty: " + part.quantity + " , Amt: " + part.amount + " (Updated)  ",
                        // time: new Date().getTime.toLocaleTimeString(),
                        remark: "Part Updated",
                        created_at: new Date(),
                    }
                    // console.log("Activity")
                    businessFunctions.vendorOrderLogs(vendorOrder._id, activity);
                    // await QuotationOrders.findByOneAndUpdate({_id:order.quotation},{$set:{quotation_submitted:}})
                }
            });
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Updated",
                responseData: await VendorOrders.findById(vendorOrder._id).exec()
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Successfully Updated Parts Details for the vendor Order, OrderId:" + vendorOrder._id + ", User:" + loggedInDetails.name);
            }
        }

    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order Not Found",
            responseData: {}
        });
    }

})

router.post('/vendor/order/remark/add', async (req, res, next) => {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(user).exec();

    var vendorOrder = await VendorOrders.findOne({ _id: req.body.order_id, business: business }).exec();
    if (vendorOrder) {

        // vendorOrder.remark = req.body.remark;
        // vendorOrder.updated_at = new Date();
        // await vendorOrder.save();
        // var activity = {
        //     business: business,
        //     activity_by: loggedInDetails.name,
        //     activity: "Address Updated",
        //     // time: new Date().getTime.toLocaleTimeString(),
        //     remark: "",
        //     created_at: new Date(),
        // }
        // businessFunctions.vendorOrderLogs(vendorOrder._id, activity);

        // res.status(200).json({
        //     responseCode: 200,
        //     responseMessage: "Remark Added Successfully",
        //     responseData: {
        //         // quotation: quotationDetails,
        //         // quotationOrder: await QuotationOrders.findById(quotation).exec()
        //     },
        // });
        //Abhinav New Try
        await VendorOrders.findOneAndUpdate({ _id: vendorOrder._id }, { $set: { remark: req.body.remark, updated_at: new Date() } }, { new: true }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {

                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Remark addedd: " + req.body.remark,
                    // time: new Date().getTime.toLocaleTimeString(),
                    remark: req.body.remark,
                    created_at: new Date(),
                }
                // console.log("Activity")
                businessFunctions.vendorOrderLogs(vendorOrder._id, activity);

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Remark Added Successfully",
                    responseData: {

                    }
                });
            }
        });
        //
    } else {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Order not found",
            responseData: {

            }
        });
    }

})


//New Req FOR Quotation
router.put('/quotation/items/images/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    var file_type = "";

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/partsImages',
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
                        Bucket: config.BUCKET_NAME + "/partsImages",
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
                quotation: 'required',
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
                // file: req.files[0].key,
                // type: file_type,
                var response = []
                await VendorOrders.find({ quotation: req.body.quotation })
                    .cursor().eachAsync(async (order) => {
                        var vendorOrder = await VendorOrders.findById(order._id).exec();
                        for (var p = 0; p < vendorOrder.parts.length; p++) {
                            var images = vendorOrder.parts[p].images;
                            // vendorOrder.parts[p]._id.equals(req.body.part_id) && 
                            // "https://s3.ap-south-1.amazonaws.com/careager/partsImages/"
                            if (p == req.body.index) {
                                var data = {
                                    // file_address: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/partsImages/" + req.files[0].key,
                                    src: "https://s3.ap-south-1.amazonaws.com/" + config.BUCKET_NAME + "/partsImages/" + req.files[0].key,
                                    file: req.files[0].key,
                                    index: order.parts[p].images.length + 1,
                                    status: 'Active',
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                }
                                images.push(data);
                                vendorOrder.parts[p].images = images;
                                await vendorOrder.markModified('parts');
                                await vendorOrder.save();
                                response = [data]
                                break;
                            }
                        }
                    })
                var vOrder = await VendorOrders.findOne({ quotation: req.body.quotation }).select('parts').exec()
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "File has been uploaded",
                    responseData: { image: response[0] }
                })
            }
        }
    });
});
router.delete('/quotation/items/image/delete', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    // var image_id = req.body.id;
    // const media = await VendorOrders.findOne({ quotation: req.body.quotation }).exec();
    if (req.body.file) {
        var params = {
            Bucket: config.BUCKET_NAME + "/partsImages",
            Key: req.body.file
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
                await VendorOrders.find({ quotation: req.body.quotation })
                    .cursor().eachAsync(async (order) => {
                        var vendorOrder = await VendorOrders.findById(order._id).exec();
                        for (var p = 0; p < vendorOrder.parts.length; p++) {
                            // var images = vendorOrder.parts[p].images;
                            if (p == req.body.item_index) {
                                // console.log("Image File = " + req.body.file)
                                for (var i = 0; i < vendorOrder.parts[p].images.length; i++) {
                                    if (vendorOrder.parts[p].images[i].file == req.body.file) {
                                        vendorOrder.parts[p].images.splice(i, 1)
                                        // console.log("Matched  ")
                                        await vendorOrder.markModified('images');
                                        await vendorOrder.markModified('parts');
                                        // await vendorOrder.markModified('images');
                                        await vendorOrder.save();
                                        break;
                                    }
                                }
                            }
                        }
                    })
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
router.post('/quotation/cars/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    var rules = {
        quotation: 'required',
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
        var cars = []
        var quotation = await QuotationOrders.findById(req.body.quotation).exec();
        if (quotation) {
            cars = quotation.cars
            var data = {
                title: req.body.title,
                vin: req.body.vin,
                varinat: req.body.varinat,
                mfg: req.body.mfg
            }
            cars.push(data)
            await QuotationOrders.findOneAndUpdate({ _id: quotation._id }, { $set: { cars: cars } }, { new: true }, async function (err, doc) {
                if (err) {
                    var json = ({
                        responseCode: 400,
                        responseMessage: "Please Try Again",
                        responseData: err
                    });
                    res.status(400).json(json)
                }
                else {

                    var activity = {
                        business: business,
                        activity: "New Car Added - " + "Title: " + req.body.title + " " + ",Vin: " + req.body.vin + " ,MFG: " + req.body.mfg,
                        activity_by: loggedInDetails.name,
                        remark: "",
                        created_at: new Date(),
                    }

                    businessFunctions.QuotationItemAddLog(quotation._id, activity);




                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Car Added Succesfully",
                        // responseData: await QuotationOrders.findById(req.body.quotation).select('cars').exec()
                        responseData: {}
                    })
                }
            })
        } else {
            var json = ({
                responseCode: 400,
                responseMessage: "Quotation not found",
                responseData: err
            });
            res.status(400).json(json)
        }
    }
});
// quotation/items/car/set
router.put('/quotation/items/car/set', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    var rules = {
        quotation: 'required',
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
        await VendorOrders.find({ quotation: req.body.quotation })
            .cursor().eachAsync(async (order) => {
                var vendorOrder = await VendorOrders.findById(order._id).exec();
                var index = parseInt(req.body.index);
                // if (p == req.body.index) {
                var data = {
                    title: req.body.title,
                    vin: req.body.vin,
                    mfg: req.body.mfg,
                    varinat: req.body.varinat,
                }
                // console.log("Data = " + vendorOrder.parts[index].part_no)
                vendorOrder.parts[index].car = data;
                await vendorOrder.markModified('car');
                await vendorOrder.save();
                // }
            })

        // var activity = {
        //     business: business,
        //     activity:   "Car: " + req.body.title + "( Vin: " + req.body.vin + " " + "MFG: " + req.body.mfg +") Linked with",
        //     activity_by: loggedInDetails.name,
        //     remark: "",
        //     created_at: new Date(),
        // }

        // businessFunctions.QuotationItemAddLog(quotation._id, activity);
        // console.log("Set Api")
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Car attached Succesfully",
            // responseData: await VendorOrders.find({ quotation: req.body.quotation }).select('parts').exec()
            responseData: { quotationId: req.body.quotation }

        })
    }
});

router.put('/quotation/part/link/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    var rules = {
        quotation: 'required',
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
        var quotation = await QuotationOrders.findById(req.body.quotation).exec();
        if (quotation) {
            await VendorOrders.find({ quotation: req.body.quotation })
                .cursor().eachAsync(async (order) => {
                    var vendorOrder = await VendorOrders.findById(order._id).exec();
                    var index = parseInt(req.body.item_index);
                    // console.log("Index  = " + index + " Link = " + req.body.link)
                    vendorOrder.parts[index].part_link = req.body.link;
                    await vendorOrder.markModified('parts');
                    await vendorOrder.save();
                })
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Part_link Added Successfully",
                responseData: {}
            })
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Quotation Not Found",
                responseData: {}
            })
        }
    }
});
module.exports = router