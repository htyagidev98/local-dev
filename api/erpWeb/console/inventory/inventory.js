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
const vendorOrders = require('../../../../models/vendorOrders');
const Sales = require('../../../../models/sales');



var secret = config.secret;
var Log_Level = config.Log_Level

router.get('/products/get', xAccessToken.token, async (req, res, next) => {
    let business = req.headers['business'];
    let page = 0;
    let limit = 20;
    let isAvailable = { $gte: 1 };
    if (req.query.page) page = parseInt(req.query.page);
    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.isAvailable == "false") isAvailable = { $lte: 0 };
    let list_type = [req.query.list_type];
    if (req.query.list_type == "Offline,Online") list_type = ['Offline', 'Online']
    let filters = []
    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        filters.push({
            "$match": {
                "$or": [
                    { part_no: { $regex: req.query.query, $options: 'i' } },
                    { type: { $regex: req.query.query, $options: 'i' } },
                    { models: { $regex: req.query.query, $options: 'i' } },
                    { title: { $regex: req.query.query, $options: 'i' } },
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
        });
    }

    filters.push(
        {
            $match: {
                $and: [
                    { 'stock.available': isAvailable },
                    { business: mongoose.Types.ObjectId(business) },
                    { list_type: { $in: list_type } }
                ]
            },
        },
        { $sort: { updated_at: -1 } },
        {
            $lookup: {
                from: "ProductBrand",
                localField: "product_brand",
                foreignField: "_id",
                as: "product_brand",
            }
        },
        {
            $lookup: {
                from: "ProductCategory",
                localField: "product_model",
                foreignField: "_id",
                as: "product_model",
            }
        },
        {
            $lookup: {
                from: "ProductCategory",
                localField: "category",
                foreignField: "_id",
                as: "category",
            }
        },
        {
            $lookup: {
                from: "ProductCategory",
                localField: "subcategory",
                foreignField: "_id",
                as: "subcategory",
            }
        },
        {
            $project: {
                product: 1,
                _id: 1,
                product_brand: 1,
                product_model: 1,
                category: 1,
                subcategory: 1,
                business: 1,
                title: 1,
                price: 1,
                stock: 1,
                part_no: 1,
                hsn_sac: 1,
                oes: 1,
                oem: 1,
                tax: 1,
                sku: 1,
                specification: 1,
                product_id: 1,
                short_description: 1,
                long_description: 1,
                thumbnail: 1,
                models: 1,
                services: 1,
                amount_is_tax: 1,
                offers: 1,
                unit: 1,
                warranty: 1,
                quantity: 1,
                logs: 1,
            },
        },
        { $skip: parseInt(limit) * page },
        { $limit: parseInt(limit) }
    );
    const data = await BusinessProduct.aggregate(filters);
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: {
            products: data,
        }
    });
});

router.get('/products/get/old', xAccessToken.token, async function (req, res, next) {
    let date = new Date(req.query.date)
    // console.log("Date Filter query......", date, req.query.date)
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();

    var business = req.headers['business'];
    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

    }
    // console.log("QUERY = " + req.query.query)
    // query
    //paginate
    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));

    if (req.query.limit == undefined) {
        var limit = 50;
    }
    else {
        var limit = parseInt(req.query.limit);
    }


    //paginate

    var product = [];

    if (req.query.page == undefined) {
        var page = 0;
    }
    else {
        var page = req.query.page;
    }
    // var isAvailable = { $gte: 0 }
    var isAvailable = { $ne: 'NaN' }
    // console.log("req.query.isAvailable " + req.query.isAvailable)
    if (req.query.isAvailable == 'true') {
        isAvailable = { $gte: 1 };
    }
    else {
        // isAvailable = { $gte: 0 };
        isAvailable = { $ne: 'NaN' };
    }
    // console.log("isAvailable " + isAvailable.$gte)
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
        var query = { "$match": { subcategory: mongoose.Types.ObjectId(req.query.query) }, "stock.available": isAvailable, business: mongoose.Types.ObjectId(business) }
    }
    else if (req.query.by == "brand") {
        var query = { "$match": { product_brand: mongoose.Types.ObjectId(req.query.query), "stock.available": isAvailable, business: mongoose.Types.ObjectId(business) } }
    }
    else if (req.query.by == "model") {
        var query = { "$match": { product_model: mongoose.Types.ObjectId(req.query.query), "stock.available": isAvailable, business: mongoose.Types.ObjectId(business) } }
    }
    else if (req.query.by == "id") {
        var query = { "$match": { product: mongoose.Types.ObjectId(req.query.query), "stock.available": isAvailable, business: mongoose.Types.ObjectId(business), } }
    }
    else if (req.query.by == "filter") {

        var specification = {};
        var subcategory = req.query.subcategory;
        specification["business"] = business;
        specification["stock.available"] = isAvailable;
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
        // console.log("Business Product ")
        var list_type = req.query.list_type;
        let startDate = undefined;
        let endDate = undefined;
        if (req.query.date) {
            startDate = new Date(req.query.date)
            // console.log("Query contains date...", startDate, req.query.endDate);

            if (req.query.endDate) {
                endDate = new Date(req.query.endDate)
            }
            var query = {
                "$match": {
                    business: mongoose.Types.ObjectId(business),
                    "stock.available": isAvailable,
                    list_type: { $in: list_type.split(',') },
                    created_at: { $gte: new Date(startDate), $lt: new Date(endDate) },
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
        else {
            //vinay
            var query = {
                "$match": {
                    business: mongoose.Types.ObjectId(business),
                    "stock.available": isAvailable,
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
    }
    // console.log("Query filter....", query)
    await BusinessProduct.aggregate([
        query,
        { $sort: { "updated_at": -1 } },
        // { $sort: { "price.sell_price": -1 } },
        //{$group: {_id: '$_id', data: {$push:'$$ROOT'}}},
        { $skip: limit * page },
        { $limit: limit }
    ])
        .allowDiskUse(true)
        .cursor({ batchSize: limit })
        .exec()

        .eachAsync(async function (p) {
            var title = p.title;
            if (_.includes(title, ',')) { title = title.replace(/,/g, ", ") }

            var offers = []
            await ProductOffer.find({ $or: [{ source: null }, { source: p.category }] })
                .cursor().eachAsync(async (o) => {
                    var ofrs = o.offers;
                    ofrs.forEach(function (ofr) {
                        if (ofr.offer) {
                            offers.push({
                                offer: ofr.offer
                            });
                        }
                    });
                });


            var gallery = await Gallery.find({ source: p._id }).exec();

            product.push({
                product: p.product,
                _id: p._id,
                id: p._id,
                product_brand: await ProductBrand.findById(p.product_brand).exec(),
                product_model: await ProductCategory.findById(p.product_model).exec(),
                category: await ProductCategory.findById(p.category).exec(),
                subcategory: await ProductCategory.findById(p.subcategory).exec(),
                business: p.business,
                title: _.startCase(_.toLower(title)),
                price: p.price,
                stock: p.stock,
                part_no: p.part_no,
                hsn_sac: p.hsn_sac,
                oes: p.oes,
                oem: p.oem,
                tax: p.tax,
                sku: p.sku,
                specification: p.specification,
                product_id: p.product_id,
                short_description: p.short_description,
                long_description: p.long_description,
                thumbnail: p.preview,
                models: p.models,
                services: p.services,
                amount_is_tax: p.amount_is_tax,
                offers: offers,
                unit: p.unit,
                warranty: p.warranty,
                quantity: p.quantity,
                logs: p.logs,
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
            query: query
        }
    })
});

router.post('/bill/add', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();

    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;

    var vendor = await User.findById(req.body.vendor).exec();   // Part Supllier
    var newDate = new Date();
    if (vendor) {
        // var loggedInDetails = await User.findById(decoded.user).exec();
        var log_details = {
            business: business,
            activity_by: loggedInDetails.name,
            activity: "Created",
            // time: new Date().getTime.toLocaleTimeString(),
            remark: "",
            created_at: new Date(),
        }
        var vendorOrder = null
        if (req.body.vendorOrder) {
            vendorOrder = req.body.vendorOrder
            var activity = {
                business: business,
                activity_by: loggedInDetails.name,
                activity: "Converted To Bill",
                // time: new Date().getTime.toLocaleTimeString(),
                remark: "Converted To Bill",
                created_at: new Date(),
            }
            // console.log("Activity")
            businessFunctions.vendorOrderLogs(vendorOrder, activity);
        }
        // console.log("Vendor Orde Body = " + vendorOrder)
        var bill = {
            reference_no: "",
            vendorOrder: vendorOrder,
            date: null,
            due_date: null,
            vendor: vendor._id,
            vendor_address: null,
            items: [],
            business: business,
            total: 0,
            logs: log_details,
            status: "Incomplete",
            created_at: newDate,
            updated_at: newDate,
        };
        await Purchase.create(bill).then(async function (purchase) {
            var count = await Purchase.find({ _id: { $lt: purchase._id }, business: purchase.business }).count();
            var bill_no = count + 10000;

            await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: { bill_no: bill_no } }, { new: true }, async function (err, doc) {

                // console.log("504  Vendor Order  = " + purchase.vendorOrder)
                await VendorOrders.findOneAndUpdate({ _id: purchase.vendorOrder }, { $set: { purchase: purchase._id, isBill: true } }, { new: true }, async function (err, doc) {

                    // console.log("Found Vendor Order ")
                })
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Bill has been added.",
                    responseData: purchase
                });
            });
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

router.put('/bill/update', xAccessToken.token, async function (req, res, next) {
    let reference_no = req.body.reference_no
    // console.log("Refrence no 12673 = " + reference_no)
    var rules = {
        bill: 'required',
        // reference_no: 'required',
        // address: 'required',
        // date: 'required',
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
            // var date = new Date(req.body.date).toISOString();
            if (req.body.due) {
                var due = new Date(req.body.due).toISOString();
            }
            else {
                var due = null
            }
            //vinay  Logs created
            var vendor = await User.findById(req.body.vendor).exec();

            var newDate = new Date();
            if (vendor) {
                var items = [];
                var products = req.body.items;
                if (products.length > 0) {
                    // console.log("products.length = " + products.length)
                    for (var p = 0; p < products.length; p++) {
                        if (products[p].lot != null && products[p].quantity != null) {
                            // console.log("Come inside business product finding condition....")
                            var product = await BusinessProduct.findOne({
                                part_no: products[p].part_no,
                                business: business
                            }).exec();

                            var tax_info = await Tax.findOne({ tax: products[p].tax }).exec();
                            if (tax_info) {
                                if (product) {
                                    // var rate = products[p].mrp;
                                    // var amount = products[p].mrp;
                                    // var tax_rate = tax_info.detail;
                                    var quantity = parseInt(products[p].quantity);       //Qantity     10
                                    var unit_base_price = parseFloat(products[p].unit_base_price);   //Unit_base  100
                                    var base = parseFloat(products[p].base);   //Unit_base  100 *10 =1000
                                    var tax_slab = parseFloat(products[p].tax);     //28% GST     
                                    var amount_is_tax = products[p].amount_is_tax
                                    var amount = parseFloat(products[p].amount);
                                    var tax_amount = parseFloat(amount) - parseFloat(base)    //280
                                    // var tax_amount = parseFloat(products[p].tax_amount);   //280
                                    //1280
                                    var rate = parseFloat(unit_base_price) + parseFloat(products[p].margin);      //unit_base_price+margin
                                    // var purchase_price = amount / quantity;
                                    var unit_price = parseFloat(products[p].unit_price);
                                    var discount = parseFloat(products[p].discount);
                                    var tax = products[p].tax_details;
                                    // var unit_price = products[p].unit_price
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
                                    //amount after discount
                                    // console.log("Ammount after discount= " + amount)
                                    var amount_is_tax = "exclusive";

                                    // if (products[p].amount_is_tax == "exclusive") {
                                    /*   if (amount_is_tax == "exclusive") {
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
                                       */
                                    /*
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
                                    */
                                    // var tax_details = {
                                    //     tax: tax_info.tax,
                                    //     rate: tax_info.rate,
                                    //     // amount: total,
                                    //     amount: amount,
                                    //     detail: tax
                                    // }

                                    // console.log("Items....", products[p].models)
                                    // console.log("Product " + product.product)
                                    var lot = 1
                                    items.push({
                                        item_status: products[p].item_status,
                                        product: product.product,
                                        part_no: products[p].part_no,
                                        hsn_sac: products[p].hsn_sac,
                                        part_category: products[p].part_category,    //OEM OR OES
                                        title: products[p].title,
                                        quantity: quantity,
                                        stock: products[p].quantity * lot,
                                        sku: products[p].sku,
                                        unit_base_price: unit_base_price,
                                        unit_price: unit_price,
                                        // purchase_price: purchase_price,
                                        unit: products[p].unit,
                                        lot: lot,
                                        mrp: products[p].mrp,
                                        rate: rate,
                                        base: base,
                                        // tax_amount: _.sumBy(tax, x => x.amount),
                                        tax_amount: tax_amount,
                                        amount: amount,
                                        models: products[p].models,
                                        amount_is_tax: amount_is_tax,
                                        sell_price: rate,
                                        margin: products[p].margin,
                                        discount: discount,
                                        discount_type: products[p].discount_type,
                                        discount_total: products[p].discount_total,
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        tax_info: tax,
                                        isProduct: true,
                                        isOrderItem: products[p].isOrderItem
                                    });

                                    tax = [];
                                }   /*else {
                                    // console.log("item is not found in stock = " + products[p].part_no)
                                    return res.status(422).json({
                                        responseCode: 422,
                                        responseMessage: "item is not found in stock = " + products[p].part_no,
                                        responseData: {}
                                    });
                                } }*/
                                else {
                                    var quantity = parseInt(products[p].quantity);       //Qantity     10
                                    var unit_base_price = parseFloat(products[p].unit_base_price);   //Unit_base  100
                                    var base = parseFloat(products[p].base);   //Unit_base  100 *10 =1000
                                    var tax_slab = parseFloat(products[p].tax);     //28% GST     
                                    var amount_is_tax = products[p].amount_is_tax
                                    var amount = parseFloat(products[p].amount);
                                    var tax_amount = parseFloat(amount) - parseFloat(base)    //280
                                    // var tax_amount = parseFloat(products[p].tax_amount);   //280
                                    //1280
                                    var rate = parseFloat(unit_base_price) + parseFloat(products[p].margin);      //unit_base_price+margin
                                    // var purchase_price = amount / quantity;
                                    var unit_price = parseFloat(products[p].unit_price);
                                    var discount = parseFloat(products[p].discount);
                                    var tax = products[p].tax_details;
                                    // var unit_price = products[p].unit_price
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
                                    //amount after discount
                                    // console.log("Ammount after discount= " + amount)
                                    var amount_is_tax = "exclusive";

                                    // if (products[p].amount_is_tax == "exclusive") {
                                    /*   if (amount_is_tax == "exclusive") {
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
                                       */
                                    /*
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
                                    */
                                    // var tax_details = {
                                    //     tax: tax_info.tax,
                                    //     rate: tax_info.rate,
                                    //     // amount: total,
                                    //     amount: amount,
                                    //     detail: tax
                                    // }

                                    // console.log("Items....", products[p].models)
                                    // console.log("Product " + product.product)
                                    var lot = 1
                                    items.push({
                                        item_status: products[p].item_status,
                                        product: null,
                                        part_no: products[p].part_no,
                                        hsn_sac: products[p].hsn_sac,
                                        part_category: products[p].part_category,    //OEM OR OES
                                        title: products[p].title,
                                        quantity: quantity,
                                        stock: products[p].quantity * lot,
                                        sku: products[p].sku,
                                        unit_base_price: unit_base_price,
                                        unit_price: unit_price,
                                        // purchase_price: purchase_price,
                                        unit: products[p].unit,
                                        lot: lot,
                                        mrp: products[p].mrp,
                                        rate: rate,
                                        base: base,
                                        // tax_amount: _.sumBy(tax, x => x.amount),
                                        tax_amount: tax_amount,
                                        amount: amount,
                                        models: products[p].models,
                                        amount_is_tax: amount_is_tax,
                                        sell_price: rate,
                                        margin: products[p].margin,
                                        discount: discount,
                                        discount_type: products[p].discount_type,
                                        discount_total: products[p].discount_total,
                                        tax: tax_info.tax,
                                        tax_rate: tax_info.rate,
                                        tax_info: tax,
                                        isProduct: false,
                                        isOrderItem: products[p].isOrderItem

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


                    var address = null;
                    if (req.body.address) {
                        address = req.body.address;
                    }

                    var log_details = {
                        business: business,
                        activity_by: loggedInDetails.name,
                        activity: "Update",

                        remark: "",
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
                    var total_amount = total.toFixed(2)
                    if (req.body.bill_discount > 0) {


                        discount = parseFloat(req.body.bill_discount);
                        total_amount = total.toFixed(2)

                        if (!isNaN(discount) && discount > 0) {
                            discount_total = total * (discount / 100);
                            total_amount = total_amount - parseFloat(discount_total.toFixed(2))
                        }

                    }

                    var transaction_log = await TransactionLog.find({ source: purchase._id, payment_status: "Success", }).exec();
                    var paid_total = _.sumBy(transaction_log, x => x.paid_total);
                    var due_amount = Math.ceil(total_amount) - (paid_total);

                    var bill = {
                        due_date: due,
                        due: due_amount,
                        vendor: vendor._id,
                        items: items,
                        bill_discount: discount,
                        paid_total: paid_total,
                        total_discount: discount_total,
                        business: business,
                        total: total_amount,
                        subTotal: total.toFixed(2),
                        logs: logs,
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
                responseMessage: "Purchase not found",
                responseData: {}
            });
        }
    }
});

router.get('/bill/details/get', xAccessToken.token, async function (req, res, next) {
    var rules = {
        bill: 'required',
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
        var loggedInDetails = await User.findById(decoded.user).exec();

        var p = await Purchase.findById({ _id: req.query.bill })
            .populate({ path: 'vendor_address' })
            .populate({ path: 'vendor', select: 'name username avatar avatar_address address contact_no business_info' })
            .populate({ path: 'business', select: 'name username avatar avatar_address address contact_no business_info' })
            .exec();

        if (p) {
            var bill = {
                _id: p._id,
                id: p._id,
                bill_no: p.bill_no,
                reference_no: p.reference_no,
                date: moment(p.date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                due_date: moment(p.due_date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                vendor: p.vendor,
                vendor_address: p.vendor_address,
                items: p.items,
                business: p.business,
                total: p.total,
                status: p.status,
                logs: p.logs,
                file_name: p.file_name,
                bill_discount: p.bill_discount,
                total_discount: p.total_discount,
                paid_total: p.paid_total,
                subTotal: p.subTotal,
                file_name: p.file_name,
                due: p.due,
                vendorOrder: p.vendorOrder,
                // paid_total: p.paid_total,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
            };

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Sucess",
                responseData: bill
            });
            if (req.query.print == 'print') {
                await fun.purchaseBill(p._id)
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Bill not found",
                responseData: {}
            });
        }
    }
});

router.post('/stock/item/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    // console.log("Part NO " + req.body.part_no)
    // console.log("purchase_price  " + req.body.purchase_price)
    var query = {};
    var rules = {};
    if (req.body.item_id) {
        rule = {
            item_id: 'required'
        };
        // console.log("If STOCK GET")
        query = {
            _id: req.body.item_id,
            business: business
        }
    } else if (req.body.part_no && req.body.purchase_price) {

        rule = {
            part_no: 'required',
            unit: 'required',
            purchase_price: 'required'
        };
        var floor = Math.floor(req.body.purchase_price);
        var ceil = Math.ceil(req.body.purchase_price);
        // console.log("Floor " + floor)
        // console.log("ceil " + ceil)
        // console.log("purchase_price " + req.body.purchase_price)
        // 'price.purchase_price': { $gte: floor, $lte: ceil },
        query = {

            part_no: req.body.part_no,
            unit: req.body.unit,
            // 'price.purchase_price':  req.body.purchase_price,
            'price.purchase_price': { $gte: floor, $lte: ceil },
            business: business,
        }
    } else {
        req.body.part_no = ''
        rule = {
            part_no: 'required',
            unit: 'required',
            purchase_price: 'required'
        };
    }
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
        var result = await BusinessProduct.findOne(query).populate('subcategory').populate('product_brand').exec();
        if (result) {
            res.status(200).json({
                responseCode: 200,
                responseMessage: "success",
                responseData: result
            })
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Item Not found",
                responseData: result
            })
        }
    }
});


router.get('/products/search/get', xAccessToken.token, async function (req, res, next) {
    // console.log("Api Inver-------------------- ")
    // businessFunctions.logs("INFO:/products/search/get Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));
    // console.log("Api Inver-------------------- ")

    // var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    // var secret = config.secret;
    // var decoded = jwt.verify(token, secret);
    // var user = await User.findById(decoded.user).exec();

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var result = [];
    //let regex =  req.query.query

    var regex = req.query.query
    //console.log("Outside Query = " + regex)

    if (regex.length >= 3) {
        regex = regex.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
      //  console.log("Inside Query = " + regex)
        await BusinessProduct.find({
            business: business, $or: [
                // { part_no: new RegExp(regex, "i") },
                // { title: new RegExp(regex, "i") }
                { 'part_no': { $regex: regex, $options: 'i' } },
                { 'title': { $regex: regex, $options: 'i' } },
            ]
        })
            .cursor().eachAsync(async (p) => {
                result.push({
                    _id: p._id,
                    id: p._id,
                    product: p.title,
                    part_no: p.part_no,
                    hsn_sac: p.hsn_sac,
                    specification: p.specification,
                    //long_description: p.long_description,
                    base: p.price.base,
                    price: p.price.purchase_price,
                    // price: p.price.unit_price,
                    unit: p.unit,
                    item_details: p
                })
            });
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: result
        })
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Provide some more inputs",
            responseData: []
        })
    }
});
//not currently  in use
router.post('/purchase-return/add', xAccessToken.token, async function (req, res, next) {
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
        businessFunctions.logs("DEBUG: Fatching Purchase Bill Details, PurchaseId:" + req.body.bill + ", User:" + loggedInDetails.name);
    }
    var purchase = await Purchase.findById(req.body.bill).exec();
    var newDate = new Date();
    if (purchase) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Total Purchase_Returns with their Details, PurchaseId:" + req.body.bill + ", User:" + loggedInDetails.name);
        }
        var purchase_return = await PurchaseReturn.find({ purchase: req.body.bill, status: "Closed" }).count().exec();
        // console.log("purchase_return= " + purchase_return)
        if (purchase_return == 0) {
            var bill = {
                purchase: purchase._id,
                reference_no: purchase.reference_no,
                bill_no: purchase.bill_no,
                date: purchase.date,
                due_date: purchase.due_date,
                vendor: purchase.vendor,
                vendor_address: purchase.vendor_address,
                items: purchase.items,
                business: purchase.business,
                total: purchase.total,
                status: "Active",
                created_at: newDate,
                updated_at: newDate,
            };
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Creating Purchase_Returns bill , PurchaseId:" + req.body.bill + ", Vendor_Name:" + bill.vendor.name + ", User:" + loggedInDetails.name);
            }
            PurchaseReturn.create(bill).then(async function (purchase) {
                var count = await PurchaseReturn.find({ _id: { $lt: purchase._id }, business: business }).count();
                var bill_no = count + 10000;

                PurchaseReturn.findOneAndUpdate({ _id: purchase._id }, { $set: { return_no: bill_no } }, { new: true }, async function (err, doc) {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Bill is ready for return",
                        responseData: await PurchaseReturn.findById(purchase._id).exec()
                    });
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO: Bill is ready for return, PurchaseId:" + req.body.bill + ", Vendor_Name:" + bill.vendor.name + ", User:" + loggedInDetails.name);
                    }
                });
            })
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Bill not found, PurchaseId:" + req.body.bill + ", User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Bill not found",
                responseData: {}
            });
        }
    }
    else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Bill not found, PurchaseId:" + req.body.bill + ", User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Bill not found",
            responseData: {}
        });
    }
});

//Return whole bills Items
router.put('/bill/revert/', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /bill/revert/ Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();

    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Purchase Bill Details, PurchaseId:" + req.body.bill + ", User:" + loggedInDetails.name);
    }
    var purchase = await Purchase.findById(req.body.bill).exec();
    let vendor = await User.findOne({ _id: mongoose.Types.ObjectId(purchase.vendor) }).exec()
    var loggedInDetails = await User.findById(user).exec();

    if (purchase) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG:(businessFunctions.checkStock(purchase._id, purchase.items, business) function called.");
        }
        var checkStock = await q.all(businessFunctions.checkStock(purchase._id, purchase.items, business));
        // console.log("checkStock= " + checkStock)
        if (checkStock) {
            var products = purchase.items;
            for (var p = 0; p < products.length; p++) {
                // var removed = 
                if (products[p].item_status == "Completed") {
                    var removed = await q.all(businessFunctions.purchaseStockRemove(purchase._id, products[p], business, vendor, loggedInDetails));
                    if (removed) {
                        products[p].item_status = "InCompleted"
                        await purchase.markModified('items');
                        await purchase.save()
                            .then(async function (ress) {
                                // console.log("Item Saved = " + p)

                                // await businessFunctions.stockRemove(purchase._id, items, business);
                                // console.log("Data saved...")
                            })
                            .catch(err => {
                                // console.log("Error...", err)
                            })
                    }
                    else {
                        // console.log("This item is not availale = " + products.part_no)
                    }
                    // console.log("Incompte Item Not need to Remove from Stock" + products[p].part_no)

                }

            }
            // var loggedInDetails = await User.findById(decoded.user).exec();
            var log_details = {
                business: business,
                activity_by: loggedInDetails.name,
                activity: "Bill Returned",
                // time: new Date().getTime.toLocaleTimeString(),
                remark: "",
                created_at: new Date(),
            }
            var logs = []
            if (purchase.logs) {
                logs = purchase.logs
                logs.push(log_details)
            } else {
                logs.push(log_details)
            }
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Updating Bill Status As Incomplete, PurchaseId:" + purchase._id);
            }
            await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: { status: "Incomplete", logs: logs, updated_at: new Date() } }, { new: true }, async function (err, doc) {
                var purchaseReturn = q.all(businessFunctions.addPurchaseReturn(doc._id, business));
                var transactionData = {
                    user: doc.vendor,
                    business: doc.business,
                    status: 'Purchase Returned',
                    type: 'Purchase Returned',
                    paid_by: '-',
                    activity: "Purchase Returned",
                    source: doc._id,
                    bill_id: doc.reference_no,
                    bill_amount: parseFloat(doc.total),
                    transaction_amount: parseFloat(doc.total),
                    balance: parseFloat(doc.total),
                    total: parseFloat(doc.total),
                    paid_total: parseFloat(doc.total),
                    due: 0,
                    payment_status: "Pending",
                    payment_mode: '-',
                    received_by: loggedInDetails.name,
                    transaction_id: '-',
                    transaction_date: new Date(),
                    transaction_status: 'Success',
                    transaction_response: '-',
                    transaction_type: "Purchase Returned",
                }
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: businessFunctions.addTransaction(transactionData) function called.");
                }
                q.all(businessFunctions.addTransaction(transactionData));

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Updated...",
                    responseData: {}
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Bill Updated Successfully, PurchaseId:" + purchase._id + ", User:" + loggedInDetails.name);
                }
            });

        } else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Insufficient Qantity in stock, User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Insufficient Qantity in stock ",
                responseData: {}
            });
        }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Purchase not found",
            responseData: {}
        });
    }
});

//Return Single item
router.put('/bill/item/return', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /bill/item/return Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var loggedInDetails = await User.findById(decoded.user).exec();

    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;
    var item_index = req.body.item_index;
    // console.log("Bill = " + req.body.bill)
    // console.log("item_index = " + item_index)
    // console.log("Business Id = " + business)
    var purchase = await Purchase.findById(req.body.bill).exec();
    let vendor = await User.findOne({ _id: purchase.vendor }).exec()

    var loggedInDetails = await User.findById(user).exec();
    if (purchase) {
        // var checkStock = await q.all(businessFunctions.checkStock(purchase._id, purchase.items, business));
        // console.log("checkStock= " + checkStock)
        // if (checkStock) {
        var products = purchase.items;
        // console.log("products[item_index] = " + products[item_index])
        var items = products[item_index]
        var quantity = parseFloat(req.body.quantity);
        if (quantity > 0) {
            // var quantity = 7
            // return res.json({ "Items ": items })
            var removed = false
            if (items.item_status != "InCompleted") {
                removed = await q.all(businessFunctions.stockRemoveSingleItem(purchase._id, items, quantity, business, vendor, loggedInDetails));
            }

            // return res.status(200).json({
            //     responseCode: 400,
            //     responseMessage: "SKU Stockd ",
            //     responseData: removed
            // });
            // var removed = true
            // console.log("Removed = " + removed)

            if (removed) {
                // products[item_index].item_status = "InCompleted"
                // console.log("Remove Quantity = ", quantity)
                // console.log("Stock Previus = " + products[item_index].stock)
                var stock = parseFloat(products[item_index].stock)
                // var final = stock - quantity;
                var finalStock = stock - quantity
                // console.log("Final  = ", finalStock)
                // console.log("Final Stock = ", parseFloat(products[item_index].stock) - parseFloat(quantity))
                var status = 'Complete'
                if (finalStock == 0) {
                    products[item_index].item_status = "InCompleted"
                    // products[item_index].unit_base_price
                    status = "Incomplete";
                }
                var unit_tax = products[item_index].unit_price - products[item_index].unit_base_price;
                var tax_amount = unit_tax * finalStock
                var base_amount = products[item_index].unit_base_price * finalStock;
                products[item_index].stock = finalStock;
                products[item_index].quantity = finalStock;
                products[item_index].amount = products[item_index].unit_price * finalStock;
                products[item_index].base = base_amount;
                products[item_index].tax_amount = tax_amount;

                var total_amount = base_amount;

                var tax_info = await Tax.findOne({ tax: products[item_index].tax }).exec();
                // return res.json(tax_info)
                if (tax_info) {
                    if (products[item_index].amount_is_tax == "exclusive") {
                        var t = 0
                        var tax_on_amount = base_amount;
                        var tax_rate = tax_info.detail;
                        if (tax_rate.length > 0) {
                            for (var r = 0; r < tax_rate.length; r++) {
                                if (tax_rate[r].rate != tax_info.rate) {
                                    t = tax_on_amount * (tax_rate[r].rate / 100);
                                    total_amount = total_amount + t;
                                    tax.push({
                                        tax: tax_rate[r].tax,
                                        rate: tax_rate[r].rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                                else {
                                    t = tax_on_amount * (tax_info.rate / 100);
                                    total_amount = total_amount + t;
                                    tax.push({
                                        tax: tax_info.tax, tax_rate: tax_info.rate,
                                        rate: tax_info.rate,
                                        amount: parseFloat(t.toFixed(2))
                                    })
                                }
                            }
                        }

                    }
                    var tax_details = {
                        // tax: tax_info.tax,
                        // rate: tax_info.rate,
                        // amount: total,
                        // amount: total_amount,
                        detail: tax
                    }
                }
                products[item_index].tax_info = tax;
                await purchase.markModified('items');
                purchase.total = purchase.total - (products[item_index].unit_price * quantity);
                await purchase.markModified('total');
                await purchase.save()
                    .then(async function (ress) {
                        // console.log("Item Saved = " + p)
                        // await businessFunctions.stockRemove(purchase._id, items, business);
                        // console.log("Data saved...")
                    })
                    .catch(err => {
                        // console.log("Error...", err)
                    })

                // var loggedInDetails = await User.findById(decoded.user).exec();
                var log_details = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Bill Item  Returned",
                    // time: new Date().getTime.toLocaleTimeString(),
                    remark: req.body.remark,
                    // remark: products[item_index].title + " returned of Amount = " + products[item_index].amount,
                    created_at: new Date(),
                }
                var logs = []
                if (purchase.logs) {
                    logs = purchase.logs
                    logs.push(log_details)
                } else {
                    logs.push(log_details)
                }

                await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: { status: status, logs: logs, updated_at: new Date() } }, { new: true }, async function (err, doc) {

                    //Signel item returnd entry
                    var transactionData = {
                        user: doc.vendor,
                        business: doc.business,
                        status: 'Purchase',
                        type: 'Purchase',
                        paid_by: '-',
                        activity: "Purchase",
                        source: doc._id,
                        bill_id: doc.reference_no,
                        bill_amount: doc.total,
                        transaction_amount: doc.total,
                        balance: doc.total,
                        total: doc.total,
                        paid_total: doc.total,
                        due: 0,
                        payment_status: "Pending",
                        payment_mode: '-',
                        received_by: loggedInDetails.name,
                        transaction_id: '-',
                        transaction_date: new Date(),
                        transaction_status: 'Success',
                        transaction_response: '-',
                        transaction_type: "Purchase Returned",
                    }
                    q.all(businessFunctions.addTransaction(transactionData));

                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Updated...",
                        responseData: doc
                    });
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO: Item Successfully Returned, User:" + loggedInDetails.name);
                    }
                });
            } else {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING:Insufficient Qantity in stock to retrun, BillId:" + req.body.bill);
                }
                res.status(200).json({
                    responseCode: 400,
                    responseMessage: "Insufficient Qantity in stock to retrun",
                    responseData: {}
                });
            }


        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Quantity not to be Zero",
                responseData: {}
            });
        }
        // } 
        // else {
        //     res.status(200).json({
        //         responseCode: 400,
        //         responseMessage: "Insufficient items in stock ",
        //         responseData: {}
        //     });
        // }
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Purchase not found",
            responseData: {}
        });
    }
});

//Delete Bill & return all items
router.delete('/bill/delete', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /bill/delete Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        query: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, BillId is required to Delete Bill.");
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
        var product = new Object();
        var result = [];
        var tax = [];
        var total = 0;
        // var purchase = await Purchase.findOne({ _id: req.query.query, status: "Incomplete" }).exec();
        var purchase = await Purchase.findOne({ _id: req.query.query }).exec();
        let vendor = await User.findOne({ _id: purchase.vendor }).exec()
        var loggedInDetails = await User.findById(user).exec();
        if (purchase) {
            var checkStock = await q.all(businessFunctions.checkStock(purchase._id, purchase.items, business));
            // console.log("checkStock= " + checkStock)
            if (checkStock) {
                var products = purchase.items;
                for (var p = 0; p < products.length; p++) {
                    // var removed = 
                    if (products[p].item_status == "Completed") {
                        var removed = await q.all(businessFunctions.purchaseStockRemove(purchase._id, products[p], business, vendor, loggedInDetails));
                        if (removed) {
                            products[p].item_status = "InCompleted"
                            await purchase.markModified('items');
                            await purchase.save()
                                .then(async function (ress) {
                                    // console.log("Item Saved = " + p)

                                    // await businessFunctions.stockRemove(purchase._id, items, business);
                                    // console.log("Data saved...")



                                })
                                .catch(err => {
                                    // console.log("Error...", err)
                                })
                        }
                        else {
                            // console.log("This item is not availale = " + products.part_no)
                        }
                        // console.log("Incompte Item Not need to Remove from Stock" + products[p].part_no)
                    }

                }
                // var loggedInDetails = await User.findById(decoded.user).exec();
                var log_details = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Deleted",
                    // time: new Date().getTime.toLocaleTimeString(),
                    remark: "",
                    created_at: new Date(),
                }
                var logs = []
                if (purchase.logs) {
                    logs = purchase.logs
                    logs.push(log_details)
                } else {
                    logs.push(log_details)
                }
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("DEBUG: Updating the bill status as Deleted, BillId:" + purchase._id + ", User:" + loggedInDetails);
                }
                await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: { status: "Deleted", logs: logs, updated_at: new Date() } }, { new: true }, async function (err, doc) {

                    var transactionData = {
                        user: doc.vendor,
                        business: doc.business,
                        status: 'Purchase Deleted',
                        type: 'Purchase Cancelled',
                        paid_by: '-',
                        activity: "Purchase Deleted",
                        source: doc._id,
                        bill_id: doc.reference_no,
                        bill_amount: doc.total.toFixed(2),
                        transaction_amount: doc.total.toFixed(2),
                        balance: doc.total.toFixed(2),
                        total: doc.total.toFixed(2),
                        paid_total: doc.total.toFixed(2),
                        due: 0,
                        payment_status: "Pending",
                        payment_mode: '-',
                        received_by: loggedInDetails.name,
                        transaction_id: '-',
                        transaction_date: new Date(),
                        transaction_status: 'Success',
                        transaction_response: '-',
                        transaction_type: "Purchase Cancelled",
                    }
                    q.all(businessFunctions.addTransaction(transactionData));
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Successfully Deleted...",
                        responseData: {}
                    });
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO: Bill Successfully Deleted, BillId:" + req.query.query + ", User:" + loggedInDetails.name);
                    }
                });

            } else {
                if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                    businessFunctions.logs("WARNING: Insufficient Qantity in stock for deleting the Bill, BillId:" + req.query.query + ", User:" + loggedInDetails.name);
                }
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Insufficient Qantity in stock ",
                    responseData: {}
                });
            }
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Purchase not found",
                responseData: {}
            });
        }
        // if (purchase) {
        //     Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: { status: "Deleted" } }, { new: false }, async function (err, doc) {
        //         if (err) {
        //             res.status(422).json({
        //                 responseCode: 422,
        //                 responseMessage: "Server Error...",
        //                 responseData: err
        //             });
        //         }
        //         else {
        //             res.status(200).json({
        //                 responseCode: 200,
        //                 responseMessage: "Removed Successfully",
        //                 responseData: {}
        //             });
        //         }
        //     });
        // }
        // else {
        //     res.status(400).json({
        //         responseCode: 400,
        //         responseMessage: "Purchase not found",
        //         responseData: {}
        //     });
        // }
    }
});

router.put('/bill/status/update', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;
    // console.log("Bill No To Complete = " + req.body.bill)
    var purchase = await Purchase.findOne({ _id: req.body.bill }).exec();
    var loggedInDetails = await User.findById(user).exec();
    let vendor = await User.findOne({ _id: mongoose.Types.ObjectId(purchase.vendor) }).exec()

    // return res.json({
    //     data: purchase
    // })

    if (purchase) {
        var products = purchase.items;
        for (var p = 0; p < products.length; p++) {
            // console.log(" 13101 Loop iteration = " + p + " Item name " + purchase.items[p].title)
            // await q.all(stockEntry(purchase._id, products[p], business));
            // stockEntry(purchase._id, products[p], business);
            /*  // Abhinav Tyagi 05-04-21*/
            // console.log("1328 item_status = " + purchase.items[p].item_status + "\n products[p].item_status= " + products[p].item_status + " -Item name- " + purchase.items[p].title)


            // var checkSku = await q.all(businessFunctions.stockEntry(purchase._id, products[p], business, vendor, loggedInDetails));
            // return res.status(200).json({
            //     responseCode: 200,
            //     responseMessage: "checkSku...",
            //     responseData: checkSku
            // });
            if (purchase.items[p].item_status != "Completed") {
                // console.log("Loop = " + p)
                var stockAdded = await q.all(businessFunctions.stockEntry(purchase._id, products[p], business, vendor, loggedInDetails));
                // console.log("Stock Added = " + stockAdded)
                if (stockAdded) {
                    purchase.items[p].item_status = "Completed"
                    await purchase.markModified('items');
                    await purchase.save()
                        .then(async function (ress) {
                            // console.log(" 1341 Item Saved = " + p + "\n ress= " + ress.items[p].item_status)
                            // var checkSku = 
                            // await q.all(businessFunctions.stockEntry(purchase._id, products[p], business, vendor, loggedInDetails));
                        })
                        .catch(err => {
                            // console.log("Error...", err)
                        })
                }
            } else {
                // console.log("Item Already Exists  = " + p)
            }
        }
        var log_details = {
            business: business,
            activity_by: loggedInDetails.name,
            activity: "Completed",
            // time: new Date().getTime.toLocaleTimeString(),
            remark: "",
            created_at: new Date(),
        }
        var logs = []
        if (purchase.logs) {
            logs = purchase.logs
            logs.push(log_details)
        } else {
            logs.push(log_details)
        }
        await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: { status: "Completed", logs: logs, updated_at: new Date() } }, { new: true }, async function (err, doc) {
            // console.log("Working ....")
            // console.log("Log  = " + purchase._id)
            var purchaseDetails = await Purchase.findOne({ _id: purchase._id }).exec();
            var transactionData = {
                user: purchaseDetails.vendor,
                business: purchaseDetails.business,
                status: 'Purchase',
                type: 'Purchase',
                paid_by: '-',
                activity: "Purchase",
                source: purchaseDetails._id,
                bill_id: purchaseDetails.reference_no,
                bill_amount: purchaseDetails.total,
                transaction_amount: purchaseDetails.total,
                balance: purchaseDetails.total,
                total: purchaseDetails.total,
                paid_total: purchaseDetails.total,
                due: 0,
                payment_status: "Pending",
                payment_mode: '-',
                received_by: loggedInDetails.name,
                transaction_id: '-',
                transaction_date: new Date(),
                transaction_status: 'Success',
                transaction_response: '-',
                transaction_type: "Purchase",
            }
            q.all(businessFunctions.addTransaction(transactionData));

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Updated...",
                responseData: {}
            });
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Purchase not found",
            responseData: {}
        });
    }
});
router.get('/products/brand/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var result = [];
    let regex = req.query.query
    // let regex = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    await ProductBrand.find({
        value: new RegExp(regex, "i")
    })
        .populate('category')
        .cursor().eachAsync(async (p) => {
            result.push({
                _id: p._id,
                id: p._id,
                value: p.value,
                category: p.category,
            })
        });
    // await ProductModel.find({
    //     model: new RegExp(regex, "i")
    // })
    //     .populate('brand')
    //     .cursor().eachAsync(async (p) => {
    //         result.push({
    //             _id: p._id,
    //             id: p._id,
    //             value: p.value,
    //             model: p.model,
    //             product_brand: p.brand
    //         })
    //     });
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result
    })
});
router.get('/products/brand/category/get', xAccessToken.token, async function (req, res, next) {
    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    var page = Math.max(0, parseInt(page));
    var result = [];
    let regex = req.query.query
    // let regex = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    await ProductCategory.find({category: new RegExp(regex, "i")}).cursor().eachAsync(async (c) => {
            result.push({
                _id: c._id,
                id: c._id,
                // value: p.value,
                category: c.category,
            })
        });
    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: result
    })
});


router.post('/tax_info/get', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = await User.findById(decoded.user).exec();
    let regex = req.body.tax_slab
    // console.log("Tax Rate = " + regex)
    // let regex = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    var tax_info = await Tax.findOne({
        tax: regex
    }).exec()
    if (tax_info) {
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Tax Details",
            responseData: tax_info
        })
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Tax Details not found",
            responseData: {}
        })
    }

});
router.post('/stock/item/create', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;
    var margin_total = 0
    var part_no = req.body.part_no;
    part_no = part_no.replace(/,/g, ", ");
    part_no = part_no.toUpperCase();
    var unit = req.body.unit;
    var loggedInDetails = await User.findById(user).exec();
    var floor = Math.floor(parseFloat(req.body.purchase_price).toFixed(2));
    var ceil = Math.ceil(parseFloat(req.body.purchase_price).toFixed(2));
    // console.log("Floor " + floor)
    // console.log("ceil " + ceil)
    // console.log("purchase_price " + req.body.purchase_price)
    // 'price.purchase_price': { $gte: floor, $lte: ceil },
    var businessProduct = await BusinessProduct.find({ part_no: part_no, 'price.purchase_price': { $gte: floor, $lte: ceil }, unit: unit, business: business }).exec();
    if (businessProduct.length == 0) {
        var tax_slab = req.body.tax;
        var tax_details = req.body.tax_details
        var remark = req.body.remark;
        var sale_price = parseFloat(req.body.sale_price); //Sale Price
        var margin = req.body.margin  //Margin
        var base_price = parseFloat(req.body.base_price)
        var purchase_price = parseFloat(req.body.purchase_price).toFixed(2) //Purchase Price
        var mrp = parseFloat(req.body.mrp)  //mrp
        var product_brand = null;
        if (req.body.product_brand && req.body.product_brand != "NaN" && req.body.product_brand != "") {
            product_brand = req.body.product_brand; //ObjectId
        }
        var brand_category = null;
        if (req.body.brand_category && req.body.brand_category != '' && req.body.brand_category != "NaN") {
            var brand_category = req.body.brand_category; //ObjectId
        }

        var category = req.body.category;   //OEM or OES   partNo_category
        var item_name = req.body.item_name; //Item name 
        var hsn_sac = req.body.hsn_sac;
        var models = []
        if (req.body.models) {
            models = req.body.models;
        }
        let car_name = ""
        let item_brand = ""
        let item_category=''
        if (req.body.car_name) car_name = req.body.car_name;
        if (req.body.item_brand) item_brand = req.body.item_brand;
        if (req.body.item_category) item_category = req.body.item_category;
        // margin_total = parseFloat(margin);
        var discount = req.body.discount;
        var discount_type = req.body.discount_type;
        var isDiscount = req.body.isDiscount;
        // console.log("New Business Product Entry")
        // tax_type
        var tax_info = await Tax.findOne({ tax: tax_slab }).exec();  //products[p].tax = "28.0% GST"
        var rate = parseFloat(purchase_price);    //sale price
        var amount = parseFloat(purchase_price);
        var tax_rate = tax_info.detail;
        if (mrp == 'NaN') {
            mrp = 0
        }
        var total_amount = 0
        if (margin) {
            margin = margin.toString();
            if (margin.indexOf("%") >= 0) {
                margin = parseFloat(margin);
                if (!isNaN(margin) && margin > 0) {
                    margin_total = base_price * (margin / 100);
                }
            }
            else {
                margin_total = parseFloat(margin)
            }
        }
        // if (req.body.isDiscount) {
        // console.log("Discount prints here...", discount)
        //     if (discount.indexOf("%") >= 0) {
        // console.log("602 - Discount If Condition = " + discount)
        //         discount = parseFloat(discount);
        //         if (!isNaN(discount) && discount > 0) {
        //             var discount_total = amount * (discount / 100);
        //             amount = amount - parseFloat(discount_total.toFixed(2))
        //         }
        //     }
        //     else {
        // console.log("610 - Discount ELSE Condition= " + discount)


        //         discount = parseFloat(discount);
        //         if (!isNaN(discount) && discount > 0) {
        //             amount = amount - parseFloat(discount.toFixed(2))
        //         }
        //     }
        // }
        var amount_is_tax = "exclusive";
        /*   // if (req.body.amount_is_tax) {
         //     amount_is_tax = req.body.amount_is_tax
         // }
         // console.log("Ta Type = " + amount_is_tax)
             if (amount_is_tax == "exclusive") {
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
         if (amount_is_tax == "inclusive") {
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
            }*/
        var taxes = {
            tax: tax_info.tax,
            rate: tax_info.rate,
            amount: amount,
            detail: tax_details
        }
        var sku = {
            sku: req.body.store_location,
            total: 0,
            available: 0,
            created_at: new Date()
        };
        var stock = {
            total: 0,
            consumed: 0,
            available: 0,
        };
        var total_amount = parseFloat(base_price) + parseFloat(margin_total);
        // console.log("Total Amountn = " + total_amount)
        var tax_on_amount = total_amount;
        if (tax_rate.length > 0) {
            for (var r = 0; r < tax_rate.length; r++) {
                if (tax_rate[r].rate != tax_info.rate) {
                    var t = tax_on_amount * (tax_rate[r].rate / 100);
                    total_amount = total_amount + t;
                }
                else {
                    var t = tax_on_amount * (tax_info.rate / 100);
                    total_amount = total_amount + t;
                }
            }
        }


        var price = {
            base: base_price, //base price with GST
            tax_amount: _.sumBy(tax_details, x => x.amount), //Tax Amount
            purchase_price: purchase_price,  //base + GST on base
            rate: parseFloat(base_price) + parseFloat(margin_total),
            // amount: parseFloat(base_price) + parseFloat(margin) + _.sumBy(tax_details, x => x.amount),
            amount: total_amount,
            mrp: mrp,
            discount: discount,
            discount_type: discount_type,
            isDiscount: isDiscount,
            margin: margin,
            sell_price: sale_price,
            margin_total: margin_total,

        }

        var list_type = [];
        list_type.push("Offline");
        var purchases = [];
        // console.log("1772 Amount = " + amount)
        var data = {
            purchase: null,
            purchases: purchases,
            business: business,
            product: null,
            product_id: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
            part_no: part_no, //mend
            product_brand: product_brand, //
            product_model: null,
            model: null,
            category: null,
            // _subcategory: brand_category,
            subcategory: brand_category,
            title: item_name,
            short_description: "",
            long_description: "",
            thumbnail: "",
            specification: "",
            hsn_sac: hsn_sac,
            quantity: 0,
            unit: unit,
            models: models,
            car_name: car_name,
            item_brand: item_brand,
            item_category: item_category,
            stock: stock,
            sku: sku,
            list_type: list_type,
            price: price,
            amount_is_tax: amount_is_tax,
            tax: tax_info.tax,
            tax_rate: tax_info.rate,
            tax_type: tax_info.tax.split('% ').pop(),
            // tax_type: "GST",
            part_category: category,
            tax_info: taxes,
            list_type: list_type,

            created_at: new Date(),
            updated_at: new Date()
        };
        var updatedData = {}

        await BusinessProduct.create(data).then(async function (bp) {

            // console.log(bp._id)
            var activity = {
                vendor_name: "Created",
                quantity: 0,
                unit_price: purchase_price,
                price: 0,
                received_by: loggedInDetails.name,
                purchase: null,
                remark: remark,
                business: business,
                activity: "Created",
                created_at: new Date()
            };
            // console.log("Activity")
            fun.productLog(bp._id, activity);
            var p = await BusinessProduct.findOne({ _id: bp._id }).exec();
            updatedData = {
                _id: p._id,
                id: p._id,
                product: p.title,
                part_no: p.part_no,
                hsn_sac: p.hsn_sac,
                specification: p.specification,
                base: p.price.base,
                price: p.price.purchase_price,
                unit: p.unit,
                item_details: p
            }

        });

        res.status(200).json({
            responseCode: 200,
            responseMessage: "Item Created Successfully",
            responseData: updatedData
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Item Already Exist",
            responseData: {}
        });
    }
});
router.put('/stock/item/edit', xAccessToken.token, async function (req, res, next) {
    var rules = {
        unit: 'required',
        itemId: 'required',
        part_no: 'required'
    };
    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Some fileds are missing",
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
        // var part_no = req.body.part_no;
        var unit = req.body.unit;
        var loggedInDetails = await User.findById(user).exec();
        var part_no = req.body.part_no;
        part_no = part_no.replace(/,/g, ", ");
        part_no = part_no.toUpperCase();
        var unit = req.body.unit;
        var loggedInDetails = await User.findById(user).exec();

        var businessProduct = await BusinessProduct.findOne({ _id: req.body.itemId, business: business }).exec();
        if (businessProduct) {
            var tax_slab = req.body.tax;
            var tax_details = req.body.tax_details
            var remark = req.body.remark;
            var sale_price = parseFloat(req.body.sale_price); //Sale Price
            var margin = parseFloat(req.body.margin)  //Margin
            var base_price = parseFloat(req.body.base_price)
            var purchase_price = parseFloat(req.body.purchase_price).toFixed(2) //Purchase Price
            var mrp = parseFloat(req.body.mrp)  //mrp
            var category = req.body.category;   //OEM or OES   partNo_category
            var item_name = req.body.item_name; //Item name 
            var hsn_sac = req.body.hsn_sac;
            var models = req.body.models;
            margin_total = parseFloat(margin);
            var discount = req.body.discount;
            var discount_type = req.body.discount_type;
            var isDiscount = req.body.isDiscount;
            // console.log(" 2164 New Business Product Entry")
            // tax_type
            var tax_info = await Tax.findOne({ tax: tax_slab }).exec();  //products[p].tax = "28.0% GST"
            var rate = parseFloat(purchase_price);    //sale price
            var amount = parseFloat(purchase_price);
            var tax_rate = tax_info.detail;
            // var base = amount;
            // console.log("Amount = " + amount)


            var amount_is_tax = "exclusive";

            var taxes = {
                tax: tax_info.tax,
                rate: tax_info.rate,
                amount: amount,
                detail: tax_details
            }
            var sku = {
                sku: req.body.store_location,
            };
            var price = {
                base: base_price, //base price with GST
                tax_amount: _.sumBy(tax_details, x => x.amount), //Tax Amount
                purchase_price: purchase_price,  //base + GST on base
                rate: parseFloat(base_price) + parseFloat(margin),
                amount: parseFloat(base_price) + parseFloat(margin) + _.sumBy(tax_details, x => x.amount),
                mrp: mrp,
                discount: discount,
                discount_type: discount_type,
                isDiscount: isDiscount,
                margin: margin,
                sell_price: sale_price
                // amount: amount,
                // sell_price: amount + parseFloat(margin),
                // margin_total: margin_total,
                // unit_price: purchase_price
            }

            var list_type = [];
            list_type.push("Offline");
            // purchases.push(purchase);
            // console.log("1772 Amount = " + amount)
            var product_brand = null
            var brand_category = null
            // var product_brand = req.body.product_brand; //ObjectId
            // var brand_category = req.body.brand_category; //ObjectId
            if (req.body.product_brand) {
                product_brand = req.body.product_brand
            }
            if (req.body.brand_category) {
                brand_category = req.body.brand_category
            }



            var data = {
                part_no: part_no,
                product_brand: product_brand,
                subcategory: brand_category,
                title: item_name,
                hsn_sac: hsn_sac,
                unit: unit,
                models: models,
                car_name: req.body.car_name,
                item_brand: req.body.item_brand,
                item_category: req.body.item_category,
                sku: sku,
                price: price,
                amount_is_tax: amount_is_tax,
                tax: tax_info.tax,
                tax_rate: tax_info.rate,
                tax_type: tax_info.tax.split('% ').pop(),
                part_category: category,
                tax_info: taxes,
                updated_at: new Date()
            };


            await BusinessProduct.findOneAndUpdate({ _id: businessProduct._id }, { $set: data }, { new: false }, async function (err, doc) {
                // console.log("2216")
                var activity = {
                    vendor_name: "Updated",
                    quantity: 0,
                    unit_price: purchase_price,
                    price: 0,
                    received_by: loggedInDetails.name,
                    purchase: null,
                    remark: remark,
                    business: business,
                    activity: "Updated",
                    created_at: new Date()
                };
                // console.log("2216")
                await fun.productLog(businessProduct._id, activity);
            });
            var p = await BusinessProduct.findOne({ _id: businessProduct._id }).exec();
            var updatedData = {
                _id: p._id,
                id: p._id,
                product: p.title,
                part_no: p.part_no,
                hsn_sac: p.hsn_sac,
                specification: p.specification,
                //long_description: p.long_description,
                base: p.price.base,
                price: p.price.purchase_price,
                // price: p.price.unit_price,
                unit: p.unit,
                item_details: p
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Updated",
                responseData: updatedData
            });
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Item Not Updated",
                responseData: {}
            });
        }
    }

});
router.put('/stock/item/delete', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /stock/item/delete Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    // var part_no = req.body.part_no;
    var loggedInDetails = await User.findById(user).exec();
    // var part_no = req.body.part_no;
    // part_no = part_no.replace(/,/g, ", ");
    // part_no = part_no.toUpperCase();
    var loggedInDetails = await User.findById(user).exec();
    var businessProduct = await BusinessProduct.findOne({ _id: req.body.item_id, business: business }).exec();
    if (businessProduct) {
        // console.log("Avaia =  " + businessProduct.stock.available)
        if (!businessProduct.stock.available) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Fatching Item Details and Deleting Item from the stock, User:" + loggedInDetails.name);
            }
            await BusinessProduct.findOneAndDelete({ _id: businessProduct._id }, { new: false }, async function (err, doc) {
                // var activity = {
                //     vendor_name: "",
                //     quantity: 0,
                //     unit_price: purchase_price,
                //     price: 0,
                //     received_by: loggedInDetails.name,
                //     purchase: null,
                //     remark: remark,
                //     business: business,
                //     activity: "Item Deleted",
                //     created_at: new Date()
                // };
                // await fun.productLog(businessProduct._id, activity);
            });

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Successfully Deleted",
                responseData: {}
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Item Deleted Successfully, User:" + loggedInDetails.name);
            }
        } else {
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Some Items are available in stock, User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Some Items are available in stock",
                responseData: {}
            });
        }
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Item Not Found, User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Item not found",
            responseData: {}
        });
    }

});

router.put('/add/basePrice', async function (req, res, next) {
    // var check = await BusinessProduct.find({ "price.base": { $eq: null } }).count().exec();
    // console.log("Count " + check)
    // if (check.length > 0) {
    var count = 0
    // "stock.available": { $gt: 0 }
    await BusinessProduct.find({})
        .cursor().eachAsync(async (v) => {
            // console.log("Id = " + v._id)
            count = count + 1
            // return res.json(v.tax_info.detail)
            if (v.tax_info) {
                var base = 0
                var purchase = 0
                tax_amount = 0
                if (v.tax_info.detail.length > 0) {
                    // console.log("2337------")
                    if (v.tax_info.detail[0].amount) {
                        // console.log("2339------")
                        var partAmountsTotal = _(v.tax_info.detail)
                            .groupBy("tax")
                            .map((v, tax) => ({
                                slab: tax,
                                tax_amount: _.sum(_.map(v, "amount")),
                            }))
                            .value()
                        // return res.json(partAmountsTotal)
                        var servicesTotal = _(partAmountsTotal)
                            .groupBy("slab")
                            .map((v, slab) => ({
                                slab: slab,
                                tax_amount: _.sum(_.map(v, "tax_amount")),

                            }))
                            .value()
                        var total_tax = 0
                        for (var i = 0; i < servicesTotal.length; i++) {
                            total_tax = total_tax + servicesTotal[i].tax_amount
                            // console.log(i + " = Taxes LOOP = " + servicesTotal[i].tax_amount + "Slab= " + servicesTotal[i].slab)
                        }


                        if (v.price.mrp && v.price.rate) {
                            // console.log("2364------")

                            base = parseFloat(v.price.mrp) - parseFloat(total_tax)
                            purchase = parseFloat(v.price.rate) - parseFloat(total_tax)

                        } else {
                            // console.log("2370------")

                            base = parseFloat(v.price.mrp) - parseFloat(total_tax)
                            purchase = parseFloat(v.price.mrp) - parseFloat(total_tax)
                            tax_amount = parseFloat(total_tax)
                        }

                        // console.log("Base price = " + base)
                    } else {
                        // console.log("2379------")

                        if (v.price && v.stock) {
                            if (v.price.mrp && v.price.rate) {
                                // console.log("2382------")

                                base = v.price.mrp / v.stock.total
                                purchase = v.price.rate / v.stock.total
                                tax_amount = 0
                            }
                            else {
                                // console.log("2382------")

                                base = v.price.mrp / v.stock.total
                                purchase = v.price.mrp / v.stock.total
                                tax_amount = 0
                            }

                        } else {
                            // console.log("2389------")

                            base = 0
                            purchase = 0
                            tax_amount = 0
                        }
                    }

                } else {
                    // console.log("2398------")

                    if (v.price && v.stock) {
                        // console.log("2401------")

                        base = v.price.mrp / v.stock.total
                        purchase = v.price.rate / v.stock.total
                        tax_amount = 0

                    } else {
                        // console.log("2408------")

                        base = 0
                        purchase = 0
                        tax_amount = 0
                    }
                }


            } else {
                // console.log("2418------")

                // console.log("Else ")
                if (v.price && v.stock) {
                    // console.log("2422------")


                    base = v.price.mrp / v.stock.total
                    purchase = v.price.rate / v.stock.total
                    tax_amount = 0

                } else {
                    // console.log("2430------")

                    base = 0
                    tax_amount = 0
                }
            }

            await BusinessProduct.findOneAndUpdate({ _id: v._id }, { $set: { "price.base": base, "price.purchase_price": purchase, "price.tax_amount": tax_amount } }, { new: false }, async function (err, doc) {
                if (err) {
                    // res.status(422).json({
                    //     responseCode: 422,
                    //     responseMessage: "Server Error",
                    //     responseData: err
                    // });
                }
                else {
                    // console.log("Added base = " + count)
                    // var updated = await User.findOne({ _id: business }).exec();
                    // res.status(200).json({
                    //     responseCode: 200,
                    //     responseMessage: "Bill Attached",
                    //     responseData: {}
                    // });
                }
            });

            // }
            // else {
            //     res.status(400).json({
            //         responseCode: 400,
            //         responseMessage: "Unauthorized",
            //         responseData: {}
            //     });
            // }
        });
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Added",
        responseData: {}
    });
});
router.put('/add/discountInfo', async function (req, res, next) {
    var count = 0
    await Purchase.find({})
        .cursor().eachAsync(async (v) => {
            // console.log("Id = " + v._id)
            count = count + 1
            var total = v.total
            var purchase = await Purchase.findById(v._id).exec();
            var items = purchase.items
            for (var i = 0; i < items.length; i++) {
                var unit_base_price = 0
                var unit_price = items[i].amount / items[i].quantity
                if (items[i].base) {
                    unit_base_price = items[i].base / items[i].quantity
                } else {
                    unit_base_price = unit_price.toFixed(2)
                }

                purchase.items[i].unit_price = unit_price.toFixed(2)
                purchase.items[i].unit_base_price = unit_base_price
                if (v.status == "Completed") {
                    purchase.items[i].item_status = "Completed"
                } else {
                    purchase.items[i].item_status = "InCompleted"
                }

            }
            await purchase.markModified('items');
            await purchase.save();
            var transaction_log = await TransactionLog.find({ source: purchase._id, payment_status: "Success", }).exec();
            var paid_total = _.sumBy(transaction_log, x => x.paid_total);
            var due_amount = Math.ceil(total) - (paid_total);

            var bill = {
                bill_discount: purchase.bill_discount,
                paid_total: paid_total,
                total_discount: purchase.total_discount,
                subTotal: total,
                due: due_amount

            };


            await Purchase.findOneAndUpdate({ _id: v._id }, { $set: bill }, { new: true }, async function (err, doc) {
                if (err) {
                    // res.status(422).json({
                    //     responseCode: 422,
                    //     responseMessage: "Server Error",
                    //     responseData: err
                    // });
                }
                else {
                    // console.log("Bill Updated  = " + count)
                }
            });

            // }
            // else {
            //     res.status(400).json({
            //         responseCode: 400,
            //         responseMessage: "Unauthorized",
            //         responseData: {}
            //     });
            // }
        });
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Added",
        responseData: {}
    });
});
router.put('/add/basePrice/new', async function (req, res, next) {
    // var check = await BusinessProduct.find({ "price.base": { $eq: null } }).count().exec();
    // console.log("Count " + check)
    // if (check.length > 0) {
    var count = 0
    // "stock.available": { $gt: 0 }
    // amount_is_tax: { $nin: ['exclusive'] }
    await BusinessProduct.find({})
        .cursor().eachAsync(async (v) => {
            count = count + 1
            // console.log(count + "  =     Id = " + v._id)
            var taxes = {}
            var tax = [];
            // return res.json(v.tax_info.detail)
            if (count > 4100) {
                // console.log("Mrp = ", v.price.mrp)
                var base = 0;
                var unit_mrp = 0
                var unit_tax_amount = 0
                var purchase_price = 0
                var base = 0
                var sell_price = v.price.sell_price;
                if (v.price.mrp) {
                    if (v.stock.total > 0) {
                        unit_mrp = parseFloat(v.price.mrp) / parseFloat(v.stock.total)
                        // if (v.amount_is_tax == 'inclusive') {
                        // console.log("Inclusive = " + count)
                        base = unit_mrp.toFixed(2) / (v.tax_rate + 100) * 100;
                        purchase_price = unit_mrp;
                        unit_tax_amount = unit_mrp - base.toFixed(2);

                        var tax_info = await Tax.findOne({ tax: v.tax }).exec();  //products[p].tax = "28.0% GST"
                        var tax_rate = tax_info.detail;
                        // if (amount_is_tax == "exclusive") {
                        var amount = base.toFixed(2);;
                        var tax_on_amount = base.toFixed(2);;
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
                        // }

                        taxes = {
                            tax: tax_info.tax,
                            rate: tax_info.rate,
                            amount: amount,
                            detail: tax
                        }
                        if (v.price.margin) {
                            sell_price = base + parseFloat(v.price.margin);
                        } else {
                            sell_price = base;

                        }
                        // }
                    }

                }
                var discount = 0
                if (v.price.discount) {
                    discount = v.price.discount

                }
                var margin = 0
                if (v.price.margin) {
                    margin = v.price.margin
                }


                // price = {
                //     base: base_price, //base price with GST
                //     tax_amount: _.sumBy(tax_details, x => x.amount), //Tax Amount
                //     purchase_price: purchase_price,  //base + GST on base
                //     rate: parseFloat(base_price) + parseFloat(margin),
                //     amount: parseFloat(base_price) + parseFloat(margin) + _.sumBy(tax_details, x => x.amount),
                //     mrp: mrp,
                //     discount: discount,
                //     discount_type: discount_type,
                //     isDiscount: isDiscount,
                //     margin: margin,
                //     sell_price: sale_price

                var total_amount = parseFloat(base) + parseFloat(margin) + parseFloat(unit_tax_amount)
                var data = {
                    tax_info: taxes,
                    amount_is_tax: "exclusive",
                    price: {
                        base: base.toFixed(2),
                        purchase_price: purchase_price.toFixed(2),
                        tax_amount: unit_tax_amount,
                        sell_price: sell_price.toFixed(2),
                        rate: sell_price.toFixed(2),
                        amount: total_amount.toFixed(2),
                        margin: margin,
                        discount: discount,
                        discount_total: discount,
                        discount_type: "Applicable",
                        mrp: v.price.mrp,
                    },
                    part_category: "OEM"
                    // "price.base": base.toFixed(2), 
                    // "price.purchase_price": purchase_price.toFixed(2), 
                    // "price.tax_amount": unit_tax_amount, 
                    // "price.sell_price": sell_price.toFixed(2), 
                    // "price.rate": sell_price.toFixed(2) 

                }
                await BusinessProduct.findOneAndUpdate({ _id: v._id }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        // res.status(422).json({
                        //     responseCode: 422,
                        //     responseMessage: "Server Error",
                        //     responseData: err
                        // });
                    }
                    else {
                        // console.log("Added base = " + count)
                        // var updated = await User.findOne({ _id: business }).exec();
                        // res.status(200).json({
                        //     responseCode: 200,
                        //     responseMessage: "Bill Attached",
                        //     responseData: {}
                        // });
                    }
                });
            }

            // }
            // else {
            //     res.status(400).json({
            //         responseCode: 400,
            //         responseMessage: "Unauthorized",
            //         responseData: {}
            //     });
            // }
        });
    res.status(200).json({
        responseCode: 200,
        responseMessage: "Added",
        responseData: {}
    });
});
// router.put('/add/unit_base_price/purchase', async function (req, res, next) {
//     var count = 0
//     await Purchase.find({})
//         .cursor().eachAsync(async (v) => {
// console.log("Id = " + v._id)
//             count = count + 1
//             var base = 0

//             var purchse = await Purchase.findOneAndUpdate({ _id: v._id }).exec();
//             var items = purchse.items;

//             for (var i = 0; i < items.length; i++) {
// console.log("Part No : " + purchse.items[i].part_no)
//                 purchse.items[i].unit_base_price = parseFloat(purchse.items[i].base) / parseInt(purchse.items[i].stock)
//                 purchse.items[i].unit_price = parseFloat(purchse.items[i].amount) / parseInt(purchse.items[i].stock)
//             }
//             await purchse.markModified('items');
//             await purchse.save()
//             // await Purchase.findOneAndUpdate({ _id: v._id }, { $set: { updated_at: new Date() } }, { new: false }, async function (err, doc) {
//             //     if (err) {
//             //         // res.status(422).json({
//             //         //     responseCode: 422,
//             //         //     responseMessage: "Server Error",
//             //         //     responseData: err
//             //         // });
//             //     }
//             //     else {
// console.log("Added base = " + count)
//             //         // var updated = await User.findOne({ _id: business }).exec();
//             //         // res.status(200).json({
//             //         //     responseCode: 200,
//             //         //     responseMessage: "Bill Attached",
//             //         //     responseData: {}
//             //         // });
//             //     }
//             // });

//             // }
//             // else {
//             //     res.status(400).json({
//             //         responseCode: 400,
//             //         responseMessage: "Unauthorized",
//             //         responseData: {}
//             //     });
//             // }
//         });
//     res.status(200).json({
//         responseCode: 200,
//         responseMessage: "Added",
//         responseData: {}
//     });
// });
router.put('/bill/details/modify', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /bill/details/modify Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    let regex = req.body.tax_slab
    // console.log("Tax Rate = " + regex)
    // let regex = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    var purchase = await Purchase.findById(req.body.bill).populate('vendor').exec()
    if (purchase) {
        var date = new Date(req.body.formattedDate).toISOString();
        var address = null;
        if (req.body.address) {
            address = req.body.address;
        }
        var log_details = {
            business: business,
            // vendor_name: "Updated",
            // activity_by: loggedInDetails.name,
            activity: "Updated",
            // time: new Date().getTime.toLocaleTimeString(),
            remark: "Bill No, Bill Date, Addresss Changed",
            created_at: new Date(),
        }
        var logs = []
        if (purchase.logs) {
            logs = purchase.logs
            logs.push(log_details)
        } else {
            logs.push(log_details)
        }
        var bill = {
            reference_no: req.body.reference_no,
            date: date,
            logs: logs,
            // due_date: due,
            vendor: purchase.vendor._id,
            vendor_address: req.body.address,
            // items: items,
            business: business,
            // total: total,
            updated_at: new Date(),
        };
        // Vinay working on purchase
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching the Purchase Bill and Update the bill details, PurchaseUd:" + purchase._id + ", User:" + loggedInDetails.name);
        }
        await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: bill }, { new: false }, async function (err, doc) {
            if (err) {
                if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                    businessFunctions.logs("ERROR: Error Occured while updating the Purchase Bill details, PurchaseUd:" + purchase._id + ", User:" + loggedInDetails.name);
                }
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
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: uccessfully Saved the Purchase Bill Details, Vendor_Name:" + bill.vendor.name + ", User:" + loggedInDetails.name);
                }
            }
        });
    } else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Tax Details not found",
            responseData: {}
        })
    }

});
router.delete('/bill/remove', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /bill/remove Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    let regex = req.body.tax_slab
    var loggedInDetails = await User.findById(decoded.user).exec();
    // console.log("Tax Rate = " + regex)
    // let regex = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    var purchase = await Purchase.findById(req.query.bill).exec()
    if (purchase) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Deleting the bill, BillId:" + purchase._id + ", User:" + loggedInDetails.name);
        }
        await Purchase.findOneAndDelete({ _id: purchase._id }, async function (err, doc) {
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
                    responseMessage: "Successfully Canclled",
                    responseData: {}
                });
                if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                    businessFunctions.logs("INFO: Bill Successfully Cancelled, BillId:" + purchase._id + ", User:" + loggedInDetails.name);
                }
            }
        });
    } else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Bill not found, BillId:" + req.body.bill + ", User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Bill not found",
            responseData: {}
        })
    }

});

/*
router.put('/purchase/bill/attach', xAccessToken.token, async function (req, res, next) {
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var bookings = [];
    var totalResult = 0;
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (loggedInDetails) {
        // console.log("Bill = " + req.body.bill + " Bill = " + business)
        var purchase = await Purchase.findOne({ _id: req.body.bill, business: business }).exec();
        // return res.json(purchase)
        if (purchase) {
            var upload = multer({
                storage: multerS3({
                    s3: s3,
                    bucket: config.BUCKET_NAME + '/PurchaseBills',
                    acl: 'public-read',
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                    // contentDisposition: 'attachment',
                    key: function (req, file, cb) {
                        let extArray = file.mimetype.split("/");
                        let extension = extArray[extArray.length - 1];

                        var filename = uuidv1() + '.' + extension;
                        if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif' || extension == 'pdf') {
                            cb(null, filename);
                        }
                        else {
                            var params = {
                                Bucket: config.BUCKET_NAME + "/PurchaseBills",
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
                        "attachment": 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/PurchaseBills/' + req.files[0].key,
                        "updated_at": new Date(),
                    }
                    // Purchase.findOne({ _id: req.body.bill, business: business 
                    Purchase.findOneAndUpdate({ _id: req.body.bill, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            // var updated = await User.findOne({ _id: business }).exec();
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Bill Attached",
                                responseData: {}
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
}); */
router.put('/purchase/bill/attach', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /purchase/bill/attach Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();

    var file_type = "";
    // console.log("Bill Id = " + req.body.purchase)
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Storing the file on the S3 Bucket");
    }
    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: config.BUCKET_NAME + '/PurchaseBills',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // contentDisposition: 'attachment',
            key: function (req, file, cb) {
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];

                var filename = uuidv1() + '.' + extension;
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif' || extension == 'pdf') {
                    cb(null, filename);
                }
                else {
                    var params = {
                        Bucket: config.BUCKET_NAME + "/PurchaseBills",
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
            console.log("Error 3204")
            var json = ({
                responseCode: 400,
                responseMessage: "Error occured",
                responseData: {}
            });
            res.status(400).json(json)
        }

        if (req.files.length == 0) {
            console.log("req.files.length = " + req.files.length)

            var json = ({
                responseCode: 400,
                responseMessage: "Media is required",
                responseData: {}
            });
            res.status(400).json(json)
        } else {

            var rules = {
                purchase: 'required'
            };

            var validation = new Validator(req.body, rules);

            if (validation.fails()) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Purchase is required",
                    responseData: {
                        res: validation.errors.all()
                    }
                })
            }
            else {

                // originalName
                var purchase = await Purchase.findById(req.body.purchase).exec();
                if (purchase) {
                    var log_details = {
                        business: business,
                        activity_by: loggedInDetails.name,
                        activity: "Bill Copy Attach",
                        // time: new Date().getTime.toLocaleTimeString(),
                        remark: "Bill Copy Attached",
                        created_at: new Date(),
                    }
                    var logs = []
                    if (purchase.logs) {
                        logs = purchase.logs
                        logs.push(log_details)
                    } else {
                        logs.push(log_details)
                    }
                    // console.log("File Name = " + req.body.originalName)
                    var data = {
                        "attachment": 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/PurchaseBills/' + req.files[0].key,
                        "file_name": req.body.originalName,
                        logs: logs,
                        "updated_at": new Date(),
                    }
                    // console.log("Bill Id Update  = " + req.body.purchase)
                    await Purchase.findOneAndUpdate({ _id: req.body.purchase }, { $set: data }, { new: false }, async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error",
                                responseData: err
                            });
                        }
                        else {
                            // var updated = await User.findOne({ _id: business }).exec();
                            res.status(200).json({
                                responseCode: 200,
                                responseMessage: "Bill Attached",
                                responseData: { name: doc.file_name }
                            });
                            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                                businessFunctions.logs("INFO: Bill Attached Successfully, PurchaseId:" + req.body.purchase + ", Bill Attach Name:" + doc.file_name);
                            }
                        }
                    });
                }

            }
        }
    });
});
router.get('/bills/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /bills/get Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var user = await User.findById(decoded.user).exec();
    var bills = [];
    var filters = [];
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

    var thumbnail = [];

    var specification = {};
    specification['$lookup'] = {
        from: "User",
        localField: "vendor",
        foreignField: "_id",
        as: "vendor",
    };
    filters.push(specification);

    var specification = {};
    specification['$unwind'] = {
        path: "$vendor",
        preserveNullAndEmptyArrays: false
    };
    filters.push(specification);
    if (req.query.query) {
        req.query.query = req.query.query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            status: { $ne: "Deleted" },
            $or: [
                { 'vendor.name': { $regex: req.query.query, $options: 'i' } },
                { 'vendor.contact_no': { $regex: req.query.query, $options: 'i' } },
                { 'vendor.business_info.gstin': { $regex: req.query.query, $options: 'i' } },
                {
                    items: {
                        $elemMatch: {
                            title: { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
                {
                    bill_no: { $regex: req.query.query, $options: 'i' }
                },
                {
                    reference_no: { $regex: req.query.query, $options: 'i' }
                },
                {
                    items: {
                        $elemMatch: {
                            part_no: { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
                {
                    items: {
                        $elemMatch: {
                            sku: { $regex: req.query.query, $options: 'i' }
                        }
                    }
                },
            ]
        };
        filters.push(specification);
    }
    else {
        var specification = {};
        specification['$match'] = {
            business: mongoose.Types.ObjectId(business),
            status: { $ne: "Deleted" },
        };
        filters.push(specification);
    }

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Total Bill Count, User:" + user.name);
    }
    var totalResult = await Purchase.aggregate(filters);

    var all = _.filter(totalResult, x => x.status == "Completed");
    var due = parseFloat(_.sumBy(all, x => x.total).toFixed(2));

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

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Bill list, User:" + user.name);
    }
    await Purchase.aggregate(filters)
        .allowDiskUse(true)
        .cursor({ batchSize: 10 })
        .exec()
        .eachAsync(async function (p) {
            bills.push({
                _id: p._id,
                id: p._id,
                bill_no: p.bill_no,
                reference_no: p.reference_no,
                date: moment(p.date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                due_date: moment(p.due_date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                vendor: {
                    name: p.vendor.name,
                    _id: p.vendor._id,
                    id: p.vendor.id,
                    name: p.vendor.name,
                    contact_no: p.vendor.contact_no,
                    email: p.vendor.email,
                    business_info: p.vendor.business_info,
                    account_info: p.vendor.account_info,
                },
                business: p.business,
                total: p.total,
                status: p.status,
                paid_total: p.paid_total,
                due: p.due,
                vendorOrder: await vendorOrders.findById(p.vendorOrder).exec(),
                created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
            });
        });

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Bill List in Response, User:" + user.name);
    }
    res.status(200).json({
        responseCode: 200,
        responseMessage: "",
        responseInfo: {
            //query: filters,
            puchased: due,
            totalResult: totalResult.length
        },
        responseData: bills
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Send Bill List in Response successfully, User:" + user.name);
    }
});

router.get('/purchase-return/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /purchase-return/get Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var loggedInDetails = await User.findById(decoded.user).exec();
    var bills = [];

    if (req.query.page == undefined) {
        var page = 0;
    } else {
        var page = req.query.page;
    }
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Purchase Return List with their detail, User:" + loggedInDetails.name);
    }
    await PurchaseReturn.find({ business: business })
        .populate({ path: 'vendor_address', select: 'name username avatar avatar_address address contact_no' })
        .populate({ path: 'vendor', select: 'name username avatar avatar_address address contact_no' })
        .sort({ updated_at: -1 })
        .skip(config.perPage * page).limit(config.perPage)
        .cursor().eachAsync(async (p) => {
            bills.push({
                _id: p._id,
                id: p._id,
                bill_no: p.bill_no,
                return_no: p.return_no,
                reference_no: p.reference_no,
                vendor_address: p.vendor_address,
                date: moment(p.date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                due_date: moment(p.due_date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                vendor: p.vendor,
                business: p.business,
                total: p.total,
                status: p.status,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
            });
        });

    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Sending Purchase Return List in Response, User:" + loggedInDetails.name);
    }

    res.status(200).json({
        responseCode: 200,
        responseMessage: "Sucess",
        responseInfo: {
            totalResult: await PurchaseReturn.find({ business: business }).count().exec()
        },
        responseData: bills
    });
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: Purchase Return List send in Response Successfully, User:" + loggedInDetails.name);
    }
});

router.get('/purchase-return/details/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /purchase-return/details/get Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        purchase: 'required',
    };

    var validation = new Validator(req.query, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, PurcahseId is Required to get purchase return details.");
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

        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Purchase Return details, PurchaseId:" + req.query.purchase + ", User:" + loggedInDetails.name);
        }
        var p = await PurchaseReturn.findById({ _id: req.query.purchase })
            .populate({ path: 'vendor_address' })
            .populate({ path: 'vendor', select: 'name username avatar avatar_address address contact_no business_info' })
            .exec();

        if (p) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Sending Purchase return details in response, Vendor_Name:" + p.vendor.name + ", User:" + loggedInDetails.name);
            }
            var bill = {
                _id: p._id,
                id: p._id,
                return_no: p.return_no,
                bill_no: p.bill_no,
                reference_no: p.reference_no,
                date: moment(p.date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                due_date: moment(p.due_date).tz(req.headers['tz']).format('YYYY-MM-DD'),
                vendor_address: p.vendor_address,
                vendor: p.vendor,
                items: p.items,
                business: p.business,
                purchase: p.purchase,
                total: p.total,
                status: p.status,
                created_at: moment(p.created_at).tz(req.headers['tz']).format('lll'),
                updated_at: moment(p.updated_at).tz(req.headers['tz']).format('lll'),
            };

            res.status(200).json({
                responseCode: 200,
                responseMessage: "Sucess",
                responseData: bill
            });
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Purchase return details send in response successfully, Vendor_Name:" + bill.vendor.name + ", User:" + loggedInDetails.name);
            }
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: Purchase not found, PurchaseId:" + req.body.purchase + ", User:" + loggedInDetails.name);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Purchase not found",
                responseData: {}
            });
        }
    }
});

router.put('/purchase-return/update', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /purchase-return/update Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

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

    var date = new Date(req.body.date).toISOString();
    if (req.body.due) {
        var due = new Date(req.body.due).toISOString();
    }
    else {
        var due = null
    }
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Purchase Details, PurchaseId:" + req.body.purchase + ", User:" + loggedInDetails.name);
    }
    var purchase = await PurchaseReturn.findById(req.body.purchase).exec();
    var newDate = new Date();
    if (purchase) {
        var items = [];
        var products = req.body.items;

        if (products.length > 0) {
            for (var p = 0; p < products.length; p++) {
                if (products[p].lot != null && products[p].quantity != null) {
                    var tax_info = await Tax.findOne({ tax: products[p].tax }).exec();
                    if (tax_info) {

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
                        }
                        else {
                            discount = parseFloat(discount);
                            if (!isNaN(discount) && discount > 0) {
                                amount = amount - parseFloat(discount.toFixed(2))
                            }
                        }


                        if (products[p].amount_is_tax == "exclusive") {
                            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                                businessFunctions.logs("DEBUG: Calculating Tax Amount for tax type Exclusive.");
                            }
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
                            product: products[p].product,
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
                            discount_total: discount_total,
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: tax,
                            status: products[p].status,
                        });

                        tax = [];
                    }
                    else {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Please check tax rate",
                            responseData: {}
                        });
                    }
                }
            }

            var returnItems = _.filter(items, status => status.status == true);
            var total = _.sumBy(returnItems, x => x.amount);

            var bill = {
                reference_no: req.body.reference_no,
                date: date,
                due_date: due,
                items: items,
                total: total,
                vendor_address: req.body.address,
                updated_at: new Date(),
            };

            PurchaseReturn.findOneAndUpdate({ _id: purchase._id }, { $set: bill }, { new: false }, async function (err, doc) {
                if (err) {
                    if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
                        businessFunctions.logs("ERROR: Error Occured  while Updating Purchase Return details, PurchaseId:" + purchase._id + ", User:" + loggedInDetails.name);
                    }
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error...",
                        responseData: {}
                    });
                }
                else {
                    res.status(200).json({
                        responseCode: 200,
                        responseMessage: "Successfully Saved",
                        responseData: await PurchaseReturn.findById(purchase._id).exec()
                    });
                    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                        businessFunctions.logs("INFO: Successfully Saved purchase return details, PurchaseId:" + purchase._id + ", User:" + loggedInDetails.name);
                    }
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
            responseMessage: "Purchase not found",
            responseData: {}
        });
    }
});

router.get('/product/detail/get', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /product/detail/get Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var token = req.headers['x-access-token'];
    var business = req.headers['business'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var loggedInDetails = await User.findById(decoded.user).exec();
    // console.log("Working   " + req.query.id + "  =Business = " + business)

    var product = {};
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Product details, ProductId:" + req.query.id + ", User:" + loggedInDetails.name);
    }
    await BusinessProduct.findOne({ _id: req.query.id, business: business })
        .cursor().eachAsync(async (p) => {

            product = {
                product: p.product,
                _id: p._id,
                id: p._id,
                product_brand: p.product_brand,
                _product_brand: p.product_brand,
                product_model: p.product_model,
                _product_model: p._product_model,
                category: p.category,
                _category: p._category,
                subcategory: p.subcategory,
                _subcategory: p._subcategory,
                business: p.business,
                title: p.title,
                part_no: p.part_no,
                hsn_sac: p.hsn_sac,
                price: p.price,
                stock: p.stock,
                sku: p.sku,
                list_type: p.list_type,
                tax: p.tax,
                amount_is_tax: p.amount_is_tax,
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
                logs: p.logs,
            }
        });

    res.status(200).json({
        responseCode: 200,
        responseMessage: "success",
        responseData: product
    })
    if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("INFO: New " + " contact_no:- " + req.body.contact_no);
    }
});

router.get('/taxes/get', async function (req, res, next) {
    businessFunctions.logs("INFO: /taxes/get Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers));

    var tz = req.headers['tz'];
    if (tz) {
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: Fatching Country details, Timezone:" + req.headers['tz']);
        }
        var country = await Country.findOne({ timezone: { $in: tz } }).exec();
        if (country) {
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Fatching various taxes and details.");
            }
            var taxes = await Tax.find({ country: country._id, type: 'GST' }).sort({ count: -1 }).exec()
            result = await q.all(businessFunctions.removeDublicateDoumnets(taxes, "tax"));
            if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("DEBUG: Sending various taxes and details in Response.");
            }
            res.status(200).json({
                responseCode: 200,
                responseMessage: "Tax Slabs",
                responseInfo: {
                    taxes: _.map(result, 'rate')
                },
                responseData: result,
            })
            if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
                businessFunctions.logs("INFO: Taxes send in Response Successfully.");
            }
        }
        else {
            if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
                businessFunctions.logs("WARNING: No country details found with given timezone, Timezone:" + req.headers['tz']);
            }
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Tax Slabs",
                responseData: {}
            })
        }
    }
    else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Timezone is required in the headers to get taxes.");
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Tax Slabs",
            responseData: {}
        })
    }
});

// purcahse/convert/bill
router.put('/purcahse/convert/bill', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /purcahse/convert/bill Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Body:" + JSON.stringify(req.body));

    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var user = decoded.user;
    var business = req.headers['business'];
    var product = new Object();
    var result = [];
    var tax = [];
    var total = 0;
    // console.log("Bill No To Complete = " + req.body.bill)
    if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
        businessFunctions.logs("DEBUG: Fatching Purchase Details, BillId:" + req.body.bill);
    }
    var purchase = await Purchase.findOne({ _id: req.body.bill, status: "Completed" }).exec();
    var loggedInDetails = await User.findById(user).exec();
    if (purchase) {
        var transactionData = {
            user: purchase.vendor,
            business: purchase.business,
            status: 'Purchase',
            type: 'Purchase',
            paid_by: '-',
            activity: "Purchase",
            source: purchase._id,
            bill_id: purchase.reference_no,
            bill_amount: purchase.total,
            transaction_amount: purchase.total,
            balance: purchase.total,
            total: purchase.total,
            paid_total: purchase.total,
            due: 0,
            payment_status: "Pending",
            payment_mode: '-',
            received_by: loggedInDetails.name,
            transaction_id: '-',
            transaction_date: new Date(),
            transaction_status: 'Success',
            transaction_response: '-',
            transaction_type: "Purchase",
        }
        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("DEBUG: businessFunctions.addTransaction(transactionData) function Called.");
        }
        var vaild = q.all(businessFunctions.addTransaction(transactionData));
        // console.log("Return = " + vaild)
        res.status(200).json({
            responseCode: 200,
            responseMessage: "Updated...",
            responseData: {}
        });
        if (Log_Level == 3 || Log_Level == 7 || Log_Level == 9 || Log_Level == 10 || Log_Level == 0) {
            businessFunctions.logs("INFO: Bill Details Updated Successfully, PurchaseId:" + req.body.bill + ", User:" + loggedInDetails.name);
        }
        // });
    }
    else {
        if (Log_Level == 2 || Log_Level == 5 || Log_Level == 8 || Log_Level == 9 || Log_Level == 0) {
            businessFunctions.logs("WARNING: Purchase not found for the billId:" + req.body.bill + ", User:" + loggedInDetails.name);
        }
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Purchase not found",
            responseData: {}
        });
    }
});

router.post('/bill/payment/out', xAccessToken.token, async function (req, res, next) {
    businessFunctions.logs("INFO: /bill/payment/out Api Called from inventory.js," + " " + "Request Headers:" + JSON.stringify(req.headers) + ", " + "Request Query:" + JSON.stringify(req.query));

    var rules = {
        bill: 'required',
        amount: 'required',
        transaction_date: 'required',
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        if (Log_Level == 1 || Log_Level == 5 || Log_Level == 6 || Log_Level == 7 || Log_Level == 0) {
            businessFunctions.logs("ERROR: Validation failed, Amount & Date are mandatory");
        }
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Amount & Date are mandatory",
            responseData: {
                res: validation.errors.all()
            }
        })
    }
    else {
        var business = req.headers['business'];
        var token = req.headers['x-access-token'];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var data = [];
        var loggedInDetails = await User.findById(decoded.user).exec();

        var purchase = await Purchase.findOne({ _id: req.body.bill }).exec();
        if (purchase) {
            var recieved = parseFloat(req.body.amount);
            var date = new Date();
            var payment_mode = req.body.payment_mode;
            var transaction_id = req.body.transaction_id;
            var due_amount = 0;
            if (purchase.due) {
                if (purchase.due.due) {
                    due_amount = purchase.due.due;
                }
            }
            await TransactionLog.create({
                user: purchase.business,
                activity: "Sales",
                business: business,
                source: purchase._id,
                paid_total: recieved,
                total: purchase.total,
                due: due_amount,
                payment_status: "Success",
                payment_mode: payment_mode,
                transaction_id: transaction_id,
                transaction_date: new Date(req.body.transaction_date).toISOString(),
                transaction_status: "Success",
                transaction_response: "Success",
                created_at: new Date(),
                updated_at: new Date(),
            }).then(async function (transaction) {

                var data = {
                    user: purchase.vendor,
                    business: business,
                    status: 'Payment-Out',
                    type: 'Payment-Out',
                    paid_by: 'Business',
                    activity: 'Payment-Out',
                    source: purchase.vendor,
                    bill_id: 'N/A',
                    bill_amount: recieved,
                    transaction_amount: recieved,
                    balance: recieved,
                    total: recieved,
                    paid_total: 0,
                    due: 0,
                    payment_status: "Success",
                    payment_mode: payment_mode,
                    received_by: loggedInDetails.name,
                    transaction_id: transaction_id,
                    transaction_date: new Date(req.body.transaction_date),
                    transaction_status: 'Success',
                    transaction_response: 'Success',
                    transaction_type: 'Payment-Out',
                    remark: req.body.remark
                }
                var valid = q.all(businessFunctions.addTransaction(data));
                if (valid) {
                    var data = {
                        user: business,
                        business: purchase.vendor,
                        status: 'Payment-In',
                        type: 'Payment-In',
                        paid_by: loggedInDetails.name,
                        activity: 'Payment-In',
                        source: business,
                        bill_id: 'N/A',
                        bill_amount: recieved,
                        transaction_amount: recieved,
                        balance: recieved,
                        total: recieved,
                        paid_total: 0,
                        due: 0,
                        payment_status: "Success",
                        payment_mode: payment_mode,
                        received_by: loggedInDetails.name,
                        transaction_id: transaction_id,
                        transaction_date: new Date(req.body.transaction_date),
                        transaction_status: 'Success',
                        transaction_response: 'Success',
                        transaction_type: 'Payment-In',
                        remark: req.body.remark
                    }
                    var valid = q.all(businessFunctions.addTransaction(data));
                }
                var transaction_log = await TransactionLog.find({ source: purchase._id, payment_status: "Success", }).exec();
                var paid_total = _.sumBy(transaction_log, x => x.paid_total);
                var due = Math.ceil(purchase.total) - (paid_total);

                var data = {
                    paid_total: paid_total,
                    due: due,
                    updated_at: new Date(),
                }
                await Purchase.findOneAndUpdate({ _id: purchase._id }, { $set: data }, { new: true }, async function (err, doc) {
                    if (err) {
                        res.status(422).json({
                            responseCode: 422,
                            responseMessage: "Server Error",
                            responseData: err
                        });
                    }
                    else {

                        var updated = await Purchase.findOne({ _id: purchase._id, business: business }).exec();
                        // var activity = {
                        //     business: business,
                        //     activity_by: loggedInDetails.name,
                        //     activity: "Payment Recieved: " + recieved,
                        //     remark: "Payment Recieved",
                        //     created_at: new Date(),
                        // }
                        // businessFunctions.salesLogs(sale._id, activity);

                        res.status(200).json({
                            responseCode: 200,
                            responseMessage: "Payment Recieved",
                            responseData: {
                                item: {},
                                payment: transaction,
                                due: updated.due,
                            }
                        });
                    }
                });
            });
        }
        else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Order not found",
                responseData: {}
            });
        }
    }
});

// xAccessToken.token,

router.put('/stock/create/business', async function (req, res, next) {
    // var token = req.headers['x-access-token'];
    // var secret = config.secret;
    // var decoded = jwt.verify(token, secret);
    // var user = decoded.user;
    var sourceBusiness = req.headers['business'];
    var business = req.body.business;
    // .sort({ updated_at: -1 })  
    console.log("Business = " + business)
    console.log("sourceBusiness = " + sourceBusiness)
    var allProducts = await BusinessProduct.find({ business: sourceBusiness }).sort({ _id: 1 }).exec();

    console.log("Alll Product Length = " + allProducts.length)
        ;
    var count = 0;
    var newItems = 0;
    var updatedItems = 0;
    var existing = 0;
    for (var i = 0; i < allProducts.length; i++) {
        var data = allProducts[i]
        // allProducts.forEach(data => {
        console.log("Total Products = " + allProducts.length + "   Count = " + i)
        var part_no = data.part_no;
        part_no = part_no.replace(/,/g, ", ");
        part_no = part_no.toUpperCase();
        var unit = data.unit;
        var floor = Math.floor(data.purchase_price);
        var ceil = Math.ceil(data.purchase_price);
        // 'price.purchase_price': { $gte: floor, $lte: ceil },
        console.log("part_no = " + part_no)
        var businessProduct = await BusinessProduct.find({ part_no: part_no, business: business, transfered: true }).sort({ _id: -1 }).exec();
        // console.log("businessProduct   = " + JSON.stringify(businessProduct, null, '\t'))

        if (businessProduct.length == 0) {
            newItems += 1
            var sku = {
                sku: data.sku.sku,
                total: 0,
                available: 0,
                created_at: new Date()
            };
            var stock = {
                total: 0,
                consumed: 0,
                available: 0,
            };
            var list_type = [];
            list_type.push("Offline");
            var purchases = [];
            // console.log("1772 Amount = " + amount)
            var data = {
                purchase: null,
                purchases: purchases,
                business: business,
                product: null,
                product_id: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                part_no: data.part_no, //mend
                product_brand: data.product_brand, //
                product_model: data.product_model,
                model: data.model,
                category: data.category,
                // _subcategory: brand_category,
                subcategory: data.subcategory,
                title: data.title,
                short_description: data.short_description,
                long_description: data.long_description,
                thumbnail: data.thumbnail,
                specification: data.specification,
                hsn_sac: data.hsn_sac,
                quantity: 0,
                unit: data.unit,
                models: data.models,
                stock: stock,
                sku: sku,
                list_type: data.list_type,
                price: data.price,
                amount_is_tax: data.amount_is_tax,
                tax: data.tax,
                tax_rate: data.tax_rate,
                tax_type: data.tax_type,
                // tax_type: "GST",
                part_category: data.part_category,
                tax_info: data.tax_info,
                list_type: data.list_type,
                transfered: true,
                created_at: new Date(),
                updated_at: new Date()
            };
            await BusinessProduct.create(data).then(async function (bp) {
                // console.log("NEW Created ---------------------------------------------------------NEW  =  " + data.part_no)
                // console.log("Part_no= " + part_no + " ----------------------------------------------------------New =  " + newItems)
                console.log("Part_no= " + part_no + " ----------------------------------------------------------New =  " + newItems)

                var activity = {
                    vendor_name: "Created",
                    quantity: 0,
                    unit_price: data.price.purchase_price,
                    price: 0,
                    received_by: 'Created',
                    purchase: null,
                    remark: 'Created',
                    business: business,
                    activity: "Created",
                    created_at: new Date()
                };
                fun.productLog(bp._id, activity);

            });
        } else if (businessProduct[0].transfered) {
            updatedItems += 1;
            console.log("Part_no= " + part_no + " ----------------------------------------------------------Updated =  " + updatedItems)

            // console.log("ALLREADY Created ---------------------------------------------------------Updated Counts " + updatedItems)
            var sku = {
                sku: data.sku.sku,
                total: 0,
                available: 0,
                created_at: new Date()
            };
            var stock = {
                total: 0,
                consumed: 0,
                available: 0,
            };
            var list_type = [];
            list_type.push("Offline");
            var purchases = [];
            // console.log("1772 Amount = " + amount)
            var data = {
                purchase: null,
                purchases: purchases,
                business: business,
                product: null,
                product_id: Math.round(+new Date() / 1000) + Math.round((Math.random() * 9999) + 1),
                part_no: data.part_no, //mend
                product_brand: data.product_brand, //
                product_model: data.product_model,
                model: data.model,
                category: data.category,
                // _subcategory: brand_category,
                subcategory: data.subcategory,
                title: data.title,
                short_description: data.short_description,
                long_description: data.long_description,
                thumbnail: data.thumbnail,
                specification: data.specification,
                hsn_sac: data.hsn_sac,
                quantity: 0,
                unit: data.unit,
                models: data.models,
                stock: stock,
                sku: sku,
                list_type: data.list_type,
                price: data.price,
                amount_is_tax: data.amount_is_tax,
                tax: data.tax,
                tax_rate: data.tax_rate,
                tax_type: data.tax_type,
                // tax_type: "GST",
                part_category: data.part_category,
                tax_info: data.tax_info,
                list_type: data.list_type,
                transfered: true,
                created_at: new Date(),
                updated_at: new Date()
            };
            await BusinessProduct.findByIdAndUpdate({ _id: businessProduct[0]._id }, { $set: data }).exec();
            // console.log("NEW Created ---------------------------------------------------------NEW  =  " + data.part_no)

            // var activity = {
            //     vendor_name: "Updated",
            //     quantity: 0,
            //     unit_price: purchase_price,
            //     price: 0,
            //     received_by: loggedInDetails.name,
            //     purchase: null,
            //     remark: remark,
            //     business: business,
            //     activity: "Created",
            //     created_at: new Date()
            // };
            // fun.productLog(bp._id, activity);

            // });
        } else {
            existing += 1;
            console.log("Part_no= " + part_no + " ----------------------------------------------------------Existing =  " + existing)

            // console.log("Personal Item -------------------- Count  =  " + existing + "--------------------- " + data.part_no)
        }
        // })
    }
    console.log("Created = " + newItems)
    console.log("Updated = " + updatedItems)
    console.log("Existing = " + await BusinessProduct.find({ business: business, transfered: false }).count().exec()
    )
    // res.status(200).json({
    //     responseCode: 200,
    //     responseMessage: "Item Created Successfully",
    //     responseData: {}
    // });

});

// bill/to/salesOrder/items/add
router.put('/bill/to/salesOrder/items/add', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var data = [];
    var convenience_charges = 0;
    var discount = 0;
    var total = 0;
    var orderItem = {}
    var order = await Order.findById(req.body.order).exec();
    var purchase = await Purchase.findById(req.body.bill).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();

    if (order && purchase) {
        var user = await User.findById(order.user).exec();

        // purchase.items[p].item_status != "Completed"
        var items = purchase.items
        console.log("4300 Purchase Item Length = " + items.length)
        for (var p = 0; p < items.length; p++) {
            // purchase.items[p].item_status != "Completed"
            console.log("4303 items[p].item_status = " + items[p].item_status + " ,Iteration = " + p)
            if (items[p].item_status == "Completed") {
                var products = items[p];
                console.log("4308 items[p].part_no = " + items[p].part_no)
                if (products.part_no != "") {
                    var businessOrder = await BusinessOrder.findOne({ order: order._id }).exec();
                    var log = {
                        status: "Confirmed",
                        type: "Counter",
                        activity: "Confirmed",
                        user: loggedInDetails._id,
                        name: loggedInDetails.name,
                        created_at: date,
                        updated_at: date,
                    }
                    var id = mongoose.Types.ObjectId();
                    if (products.id != null) {
                        id = products.id
                    }

                    console.log("4325  Iteration= " + p)

                    if (products) {
                        console.log("Products.products = " + products.product)
                        var tax_info = await Tax.findOne({ tax: products.tax }).exec();
                        var floor = Math.floor(products.unit_price);
                        var ceil = Math.ceil(products.unit_price);
                        console.log("Floor " + floor)
                        console.log("ceil " + ceil)
                        console.log("ceil " + ceil)

                        // Math.round(5.95)
                        // console.log("purchase_price " + req.body.purchase_price)
                        // 'price.purchase_price': { $gte: floor, $lte: ceil },

                        // .sort({ updated_at: -1 })
                        var part_no = products.part_no;
                        part_no = part_no.replace(/,/g, ", ");
                        part_no = part_no.toUpperCase();
                        var checkProducut = await BusinessProduct.findOne({ purchases: purchase._id, part_no: part_no, "price.purchase_price": { $gte: floor, $lte: ceil }, business: business }).sort({ updated_at: -1 }).exec();
                        // if (businessProduct.price.rate == product.rate) {
                        if (checkProducut) {
                            // console.log("checkProducut" + checkProducut.part_no)
                            var tax = [];
                            products.product = checkProducut._id;
                            var rate = products.rate;
                            var amount = products.rate * products.quantity;
                            var tax_rate = tax_info.detail;
                            var discount_total = 0;
                            var base = amount

                            var discount = products.discount;

                            // if (discount.indexOf("%") >= 0) {
                            //     discount = parseFloat(discount);
                            //     if (!isNaN(discount) && discount > 0) {
                            //         discount_total = amount * (discount / 100);
                            //         amount = amount - parseFloat(discount_total.toFixed(2))
                            //     }
                            // }
                            // else {
                            //     if (discount == "") {
                            //         discount = "0"
                            //     }

                            //     discount_total = parseFloat(discount);

                            //     if (!isNaN(discount_total) && discount_total > 0) {
                            //         amount = amount - parseFloat(discount_total.toFixed(2))
                            //     }
                            // }
                            var discount = "0"
                            var discount_total = parseFloat(discount);
                            if (products.amount_is_tax == "exclusive") {
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

                            if (products.amount_is_tax == "inclusive") {
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
                                //base = base - discount_total;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }

                            var orderItem = {
                                _id: id,
                                order: order._id,
                                product: checkProducut._id,
                                category: checkProducut.category,
                                _category: checkProducut._category,
                                subcategory: checkProducut.subcategory,
                                _subcategory: checkProducut._subcategory,
                                product_brand: checkProducut.product_brand,
                                _brand: checkProducut.product_brand,
                                // _brand: "",
                                product_model: null,
                                _model: checkProducut.product_model,
                                source: checkProducut.source,
                                part_no: products.part_no,
                                hsn_sac: products.hsn_sac,
                                unit: products.unit,
                                title: products.title,
                                quantity: products.quantity,
                                unit: products.unit,
                                sku: products.sku,
                                mrp: products.selling_price,
                                selling_price: products.sell_price,
                                rate: products.rate,
                                base: parseFloat(base.toFixed(2)),
                                discount: products.discount,
                                discount_total: parseFloat(discount_total.toFixed(2)),
                                amount_is_tax: products.amount_is_tax,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount: parseFloat(amount.toFixed(2)),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                                issued: false,
                                added_by_customer: false,
                                delivery_date: businessOrder.delivery_date,
                                tracking_no: Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000),
                                business: business,
                                created_at: new Date(),
                                updated_at: new Date()
                            };

                            await OrderLine.create(orderItem).then(async function (ol) {

                                var issued = await q.all(businessFunctions.salesPartIssue(ol, business, user, loggedInDetails));
                                if (issued) {
                                    console.log("Issuesd True...")
                                    await OrderLine.findOneAndUpdate({ _id: ol._id }, { $set: { issued: issued, updated_at: new Date() } }, { new: false }, async function (err, doc) { })
                                }

                            });
                        } else {
                            console.log("CheckProduct Not Found")
                        }

                    } else {
                        console.log("Product Not Found")
                    }


                }
                else {
                    console.log("Incomplete Item  Detatils")
                    // res.status(200).json({
                    //     responseCode: 200,
                    //     responseMessage: "Add New Item",
                    //     responseData: {}
                    // });
                }
            } else {
                console.log("Incomplete Item")
            }
        }




        console.log("Value of P = " + p)
        var orderItems = await OrderLine.find({ order: order._id, issued: true, business: business, status: { $nin: ["Cancelled"] } }).exec();
        if (businessOrder.payment.convenience_charges) {
            convenience_charges = Math.ceil(businessOrder.payment.convenience_charges);
        }
        var discount = parseFloat(_.sumBy(orderItems, x => x.discount_total).toFixed(2));
        var amount = parseFloat(_.sumBy(orderItems, x => x.amount).toFixed(2));
        var total = amount + discount + convenience_charges;

        var transaction_log = await q.all(fun.getOrderTransaction(order._id, business));
        var paid_total = transaction_log.paid_total;

        var data = {
            updated_at: new Date(),
            "payment.paid_total": paid_total,
            "payment.amount": parseFloat(amount.toFixed(2)),
            "payment.discount_total": parseFloat(discount.toFixed(2)),
            "payment.total": parseFloat(total.toFixed(2)),
            "payment.order_discount": parseFloat(order.payment.order_discount),
            due: {
                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
            }
        }

        // console.log("Issued = " + issued)

        await Order.findOneAndUpdate({ _id: order._id }, { $set: data }, { new: false }, async function (err, doc) {
            if (err) {
                // res.status(422).json({
                //     responseCode: 422,
                //     responseMessage: "Server Error",
                //     responseData: err
                // });
                console.log("Server Error")

            }
            else {
                await BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                    if (err) {
                        // res.status(422).json({
                        //     responseCode: 422,
                        //     responseMessage: "Server Error",
                        //     responseData: err
                        // });
                        console.log("Server Error")
                    }
                    else {
                        await BusinessOrder.find({ order: businessOrder.order, business: business })
                            .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                            .cursor().eachAsync(async (p) => {

                                var has_invoice = false;
                                var invoices = await OrderInvoice.find({ order: p.order._id, business: business }).select('status invoice_no').exec();

                                if (invoices.length > 0) {
                                    has_invoice = true;
                                }
                                var activity = {
                                    business: business,
                                    activity_by: loggedInDetails.name,
                                    activity: "Items added from Purchase Bill ( " + purchase.reference_no + " )",
                                    remark: "Sales Order",
                                    created_at: new Date(),
                                }
                                businessFunctions.salesOrderLogs(order._id, activity);
                                // console.log("Item Added Successfully")
                                res.status(200).json({
                                    responseCode: 200,
                                    responseMessage: "success",
                                    responseData: {}
                                });
                                // res.status(200).json({
                                //     responseCode: 200,
                                //     responseMessage: "success",
                                //     responseData:{}
                                // });
                            });
                    }
                });
            }
        });


    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order/Bill not found",
            responseData: {}
        });

    }
});

router.put('/bill/to/sale/items/add/OrdersWali', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var data = [];
    var convenience_charges = 0;
    var item_total = 0;
    var discount = 0;
    var item_total = 0;
    var total = 0;

    var sale = await Sales.findById(req.body.sale).exec();
    var purchase = await Purchase.findById(req.body.bill).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (sale && purchase) {
        // order
        // purchase.items[p].item_status != "Completed"
        var items = purchase.items
        for (var p = 0; p < items.length; p++) {
            // purchase.items[p].item_status != "Completed"
            if (items[p].item_status == "Completed") {
                var products = items[p];
                if (products.part_no != "") {
                    // var businessOrder = await BusinessOrder.findOne({ order: order._id }).exec();
                    var log = {
                        status: "Confirmed",
                        type: "Counter",
                        activity: "Confirmed",
                        user: loggedInDetails._id,
                        name: loggedInDetails.name,
                        created_at: date,
                        updated_at: date,
                    }
                    var id = mongoose.Types.ObjectId();
                    if (products.id != null) {
                        id = products.id
                    }
                    if (products) {
                        var tax_info = await Tax.findOne({ tax: products.tax }).exec();
                        if (products.product) {
                            console.log("IF  - ")

                            var product = await BusinessProduct.findOne({ _id: products.product, business: business }).exec();
                            if (product) {
                                var tax = [];
                                var rate = products.rate;
                                var amount = products.rate * products.quantity;
                                var tax_rate = tax_info.detail;
                                var discount_total = 0;
                                var base = amount

                                var discount = products.discount;

                                if (discount.indexOf("%") >= 0) {
                                    discount = parseFloat(discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        discount_total = amount * (discount / 100);
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                    }
                                }
                                else {
                                    if (discount == "") {
                                        discount = "0"
                                    }

                                    discount_total = parseFloat(discount);

                                    if (!isNaN(discount_total) && discount_total > 0) {
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                    }
                                }

                                if (products.amount_is_tax == "exclusive") {
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

                                if (products.amount_is_tax == "inclusive") {
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
                                    //base = base - discount_total;
                                }

                                var tax_details = {
                                    tax: tax_info.tax,
                                    rate: tax_info.rate,
                                    amount: total,
                                    detail: tax
                                }

                                items = {
                                    _id: id,
                                    order: order._id,
                                    product: product._id,
                                    category: product.category,
                                    _category: product._category,
                                    subcategory: product.subcategory,
                                    _subcategory: product._subcategory,
                                    product_brand: product.product_brand,
                                    _brand: product.product_brand,
                                    product_model: product.product_model,
                                    _model: product.product_model,
                                    source: product.source,
                                    part_no: products.part_no,
                                    hsn_sac: products.hsn_sac,
                                    unit: products.unit,
                                    title: products.title,
                                    sku: products.sku,
                                    mrp: products.selling_price,
                                    selling_price: products.selling_price,
                                    rate: products.rate,
                                    quantity: products.quantity,
                                    base: parseFloat(base.toFixed(2)),
                                    amount: amount,
                                    discount: products.discount,
                                    discount_total: parseFloat(discount_total.toFixed(2)),
                                    amount_is_tax: products.amount_is_tax,
                                    tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                    amount: parseFloat(amount.toFixed(2)),
                                    tax: tax_info.tax,
                                    tax_rate: tax_info.rate,
                                    tax_info: tax,
                                    issued: true,
                                    added_by_customer: false,
                                    delivery_date: null,
                                    tracking_no: Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000),
                                    business: business,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                }
                            }
                            else {
                                // return res.status(400).json({
                                //     responseCode: 400,
                                //     responseMessage: "Items not found",
                                //     responseData: {}
                                // });
                                return console.log("Server Error")

                            }
                        }
                        else {
                            console.log("Else  - ")
                            var tax = [];
                            var rate = products.rate;
                            var amount = products.rate * products.quantity;
                            var tax_rate = tax_info.detail;
                            var discount_total = 0
                            var base = amount;
                            var discount = products.discount;
                            if (products.type == 'Applicable') {
                                if (discount.indexOf("%") >= 0) {
                                    discount = parseFloat(discount);
                                    if (!isNaN(discount) && discount > 0) {
                                        discount_total = amount * (discount / 100);
                                        if (parseFloat(discount_total.toFixed(2)) > amount) {
                                            products.discount = amount.toString();
                                            discount_total = amount;
                                        }
                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                    }
                                }
                                else {
                                    discount_total = parseFloat(discount);
                                    if (!isNaN(discount_total) && discount_total > 0) {
                                        if (parseFloat(discount_total.toFixed(2)) > amount) {
                                            products.discount = amount.toString();
                                            discount_total = amount;
                                        }

                                        amount = amount - parseFloat(discount_total.toFixed(2))
                                    }
                                }
                            }


                            if (products.amount_is_tax == "exclusive") {
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

                            if (products.amount_is_tax == "inclusive") {
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

                                //base = base - discount_total;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }

                            items = {
                                _id: id,
                                order: order._id,
                                product: null,
                                category: null,
                                _category: "",
                                subcategory: null,
                                _subcategory: "",
                                product_brand: null,
                                _brand: "",
                                product_model: null,
                                _model: "",
                                source: null,
                                part_no: products.part_no,
                                hsn_sac: products.hsn_sac,
                                unit: products.unit,
                                title: products.title,
                                quantity: products.quantity,
                                unit: products.unit,
                                sku: products.sku,
                                mrp: products.selling_price,
                                selling_price: products.sell_price,
                                rate: products.rate,
                                base: parseFloat(base.toFixed(2)),
                                discount: products.discount,
                                discount_total: parseFloat(discount_total.toFixed(2)),
                                amount_is_tax: products.amount_is_tax,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount: parseFloat(amount.toFixed(2)),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                                issued: false,
                                added_by_customer: false,
                                delivery_date: null,
                                tracking_no: Math.round(+new Date() / 1000) + "-" + Math.ceil((Math.random() * 90000) + 10000),
                                business: business,
                                created_at: new Date(),
                                updated_at: new Date()
                            };
                        }
                    }

                    await OrderLine.create(items).then(async function (ol) {
                        var items = await OrderLine.find({ order: order._id, issued: true, business: business, status: { $nin: ["Cancelled"] } }).exec();
                        if (businessOrder.payment.convenience_charges) {
                            convenience_charges = Math.ceil(businessOrder.payment.convenience_charges);
                        }

                        var discount = parseFloat(_.sumBy(items, x => x.discount_total).toFixed(2));
                        var amount = parseFloat(_.sumBy(items, x => x.amount).toFixed(2));
                        var total = amount + discount + convenience_charges;

                        var transaction_log = await q.all(fun.getOrderTransaction(order._id, business));
                        var paid_total = transaction_log.paid_total;

                        var data = {
                            updated_at: new Date(),
                            "payment.paid_total": paid_total,
                            "payment.amount": parseFloat(amount.toFixed(2)),
                            "payment.discount_total": parseFloat(discount.toFixed(2)),
                            "payment.total": parseFloat(total.toFixed(2)),
                            "payment.order_discount": parseFloat(order.payment.order_discount),
                            due: {
                                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(order.payment.order_discount))
                            }
                        }
                        var user = await User.findById(order.user).exec();

                        var issued = await q.all(businessFunctions.salesPartIssue(ol, business, user, loggedInDetails));
                        if (issued) {
                            await OrderLine.findOneAndUpdate({ _id: order._id }, { $set: { issued: issued, updated_at: new Date() } }, { new: false }, async function (err, doc) { })
                        }
                        // console.log("Issued = " + issued)

                        await Order.findOneAndUpdate({ _id: ol._id }, { $set: data }, { new: false }, async function (err, doc) {
                            if (err) {
                                // res.status(422).json({
                                //     responseCode: 422,
                                //     responseMessage: "Server Error",
                                //     responseData: err
                                // });
                                console.log("Server Error")

                            }
                            else {
                                await BusinessOrder.findOneAndUpdate({ order: order._id, business: business }, { $set: data }, { new: false }, async function (err, doc) {
                                    if (err) {
                                        // res.status(422).json({
                                        //     responseCode: 422,
                                        //     responseMessage: "Server Error",
                                        //     responseData: err
                                        // });
                                        console.log("Server Error")

                                    }
                                    else {
                                        await BusinessOrder.find({ order: businessOrder.order, business: business })
                                            .populate({ path: 'order', populate: [{ path: 'user', select: 'name contact_no username email account_info ' }, { path: 'car', select: 'title variant registration_no _automaker _model' }, { path: 'address' }] })
                                            .cursor().eachAsync(async (p) => {

                                                var has_invoice = false;
                                                var invoices = await OrderInvoice.find({ order: p.order._id, business: business }).select('status invoice_no').exec();

                                                if (invoices.length > 0) {
                                                    has_invoice = true;
                                                }




                                                var activity = {
                                                    business: business,
                                                    activity_by: loggedInDetails.name,
                                                    activity: "'" + products.title + "' Added to Order",
                                                    remark: "Item Added",
                                                    created_at: new Date(),
                                                }
                                                businessFunctions.salesOrderLogs(order._id, activity);


                                                console.log("Item Added Successfully")
                                                // res.status(200).json({
                                                //     responseCode: 200,
                                                //     responseMessage: "success",
                                                //     responseData:{}
                                                // });
                                            });
                                    }
                                });
                            }
                        });
                    });
                }
                else {

                    console.log("Incomplete Item  Detatils")
                    // res.status(200).json({
                    //     responseCode: 200,
                    //     responseMessage: "Add New Item",
                    //     responseData: {}
                    // });
                }
            }
        }
        res.status(200).json({
            responseCode: 200,
            responseMessage: "success",
            responseData: {}
        });

    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Order/Bill not found",
            responseData: {}
        });

    }
});

router.put('/bill/to/sale/items/add', xAccessToken.token, async function (req, res, next) {
    var business = req.headers['business'];
    var token = req.headers['x-access-token'];
    var secret = config.secret;
    var decoded = jwt.verify(token, secret);
    var date = new Date();
    var loggedInDetails = decoded.user;
    var items = [];
    var convenience_charges = 0;
    var discount = 0;
    var item_total = 0;
    // var sale = await Sales.findById(req.body.sale).exec();
    // var parts = sale.parts;
    var parts = []
    var loggedInDetails = await User.findById(decoded.user).exec();

    var sale = await Sales.findById(req.body.sale).exec();
    var purchase = await Purchase.findById(req.body.bill).exec();
    var loggedInDetails = await User.findById(decoded.user).exec();
    if (sale && purchase) {
        // order
        // purchase.items[p].item_status != "Completed"
        // }
        // if (sale) {
        var items = purchase.items
        console.log("Parts Length = " + items.length)
        for (var p = 0; p < items.length; p++) {
            console.log("\nParts Data = " + JSON.stringify(items[p]), null, '\t')

            if (items[p].item_status == "Completed") {
                var products = items[p];
                // var products = req.body.items;
                if (products.title != "") {
                    if (products) {
                        var tax_info = await Tax.findOne({ tax: products.tax }).exec();
                        var floor = Math.floor(products.unit_price);
                        var ceil = Math.ceil(products.unit_price);
                        console.log("Floor " + floor)
                        console.log("ceil " + ceil)
                        console.log("ceil " + ceil)

                        // Math.round(5.95)
                        // console.log("purchase_price " + req.body.purchase_price)
                        // 'price.purchase_price': { $gte: floor, $lte: ceil },

                        // .sort({ updated_at: -1 })
                        var part_no = products.part_no;
                        part_no = part_no.replace(/,/g, ", ");
                        part_no = part_no.toUpperCase();
                        var checkProducut = await BusinessProduct.findOne({ purchases: purchase._id, part_no: part_no, "price.purchase_price": { $gte: floor, $lte: ceil }, business: business }).sort({ updated_at: -1 }).exec();
                        // if (businessProduct.price.rate == product.rate) {
                        if (checkProducut) {
                            console.log("checkProducut" + checkProducut.part_no)
                            var tax = [];
                            products.product = checkProducut._id;
                            var rate = products.rate;
                            var amount = products.rate * products.quantity;
                            var tax_rate = tax_info.detail;
                            var discount_total = 0;
                            var base = amount

                            var discount = products.discount;

                            // if (discount.indexOf("%") >= 0) {
                            //     discount = parseFloat(discount);
                            //     if (!isNaN(discount) && discount > 0) {
                            //         discount_total = amount * (discount / 100);
                            //         amount = amount - parseFloat(discount_total.toFixed(2))
                            //     }
                            // }
                            // else {
                            //     if (discount == "") {
                            //         discount = "0"
                            //     }

                            //     discount_total = parseFloat(discount);

                            //     if (!isNaN(discount_total) && discount_total > 0) {
                            //         amount = amount - parseFloat(discount_total.toFixed(2))
                            //     }
                            // }
                            var discount = "0"
                            var discount_total = parseFloat(discount);
                            if (products.amount_is_tax == "exclusive") {
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

                            if (products.amount_is_tax == "inclusive") {
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
                                //base = base - discount_total;
                            }

                            var tax_details = {
                                tax: tax_info.tax,
                                rate: tax_info.rate,
                                amount: total,
                                detail: tax
                            }
                            // var issued = await q.all(businessFunctions.salesPartIssue(products, business, user, loggedInDetails));
                            // if (issued) {

                            // }
                            var user = await User.findById(sale.user).exec();
                            parts.push({
                                product: checkProducut._id,
                                category: checkProducut.category,
                                _category: checkProducut._category,
                                subcategory: checkProducut.subcategory,
                                _subcategory: checkProducut._subcategory,
                                product_brand: checkProducut.product_brand,
                                _brand: checkProducut.product_brand,
                                product_model: checkProducut.product_model,
                                _model: checkProducut.product_model,
                                source: checkProducut.source,
                                part_no: products.part_no,
                                hsn_sac: products.hsn_sac,
                                unit: products.unit,
                                title: products.title,
                                sku: products.sku,
                                mrp: products.mrp,
                                selling_price: products.selling_price,
                                rate: products.rate,
                                quantity: products.quantity,
                                base: parseFloat(base.toFixed(2)),
                                amount: amount,
                                discount: products.discount,
                                discount_total: parseFloat(discount_total.toFixed(2)),
                                amount_is_tax: products.amount_is_tax,
                                tax_amount: parseFloat(_.sumBy(tax, x => x.amount).toFixed(2)),
                                amount: parseFloat(amount.toFixed(2)),
                                tax: tax_info.tax,
                                tax_rate: tax_info.rate,
                                tax_info: tax,
                                issued: await q.all(businessFunctions.salesPartIssue(products, business, user, loggedInDetails)),
                                added_by_customer: false,
                                created_at: new Date(),
                                updated_at: new Date()
                            })
                        }

                    }


                    // });
                }
                else {
                    // res.status(200).json({
                    //     responseCode: 200,
                    //     responseMessage: "Add New Item",
                    //     responseData: {}
                    // });
                }
            }
        }

        if (sale.payment.convenience_charges) {
            convenience_charges = Math.ceil(sale.payment.convenience_charges);
        }
        var discount = parseFloat(_.sumBy(parts, x => x.discount_total).toFixed(2)) + parseFloat(_.sumBy(sale.labours, x => x.discount_total).toFixed(2));
        var amount = parseFloat(_.sumBy(parts, x => x.amount).toFixed(2)) + parseFloat(_.sumBy(sale.labours, x => x.amount).toFixed(2));
        var total = amount + discount + convenience_charges;
        var transaction_log = await q.all(fun.getSalesTransaction(sale._id, business));
        var paid_total = transaction_log.paid_total;
        var data = {
            updated_at: new Date(),
            "payment.paid_total": paid_total,
            "payment.amount": parseFloat(amount.toFixed(2)),
            "payment.discount_total": parseFloat(discount.toFixed(2)),
            "payment.total": parseFloat(total.toFixed(2)),
            "payment.order_discount": parseFloat(sale.payment.order_discount),
            due: {
                due: Math.ceil(amount) + convenience_charges - paid_total - (parseFloat(sale.payment.order_discount) + parseFloat(sale.payment.discount_total))
            },
            parts: parts
        }
        console.log("Parts Length " + parts.length)
        await Sales.findOneAndUpdate({ _id: sale._id, business: business }, { $set: data }, { new: true }, async function (err, doc) {
            if (err) {
                res.status(422).json({
                    responseCode: 422,
                    responseMessage: "Server Error",
                    responseData: err
                });
            }
            else {
                var has_invoice = false;
                var invoices = await OrderInvoice.find({ sale: sale._id, business: business }).select('status invoice_no').exec();
                if (invoices.length > 0) {
                    has_invoice = true;
                }

                // var activity = {
                //     business: business,
                //     activity_by: loggedInDetails.name,
                //     activity: "'" + products.title + "'  -Added to Order",
                //     remark: "Item Added",
                //     created_at: new Date(),
                // }
                // businessFunctions.salesLogs(sale._id, activity);
                var activity = {
                    business: business,
                    activity_by: loggedInDetails.name,
                    activity: "Items added from Purchase Bill ( " + purchase.reference_no + " )",
                    remark: "Counter Sale",
                    created_at: new Date(),
                }
                businessFunctions.salesLogs(sale._id, activity);
                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "success",
                    responseData: {}
                });
            }
        });
    }
    else {
        res.status(400).json({
            responseCode: 400,
            responseMessage: "Sale not found",
            responseData: {}
        });
    }
});


////////////////ABhinav : Bill item add ?////////////////////////
router.put("/bill/items/add", xAccessToken.token, async function (req, res, next) {
    var purchase = req.body.bill;
    var rules = {
        bill: "required",
    };

    var validation = new Validator(req.body, rules);

    if (validation.fails()) {
        res.status(422).json({
            responseCode: 422,
            responseMessage: "Bill is required",
            responseData: {
                res: validation.errors.all(),
            },
        });
    } else {
        var token = req.headers["x-access-token"];
        var secret = config.secret;
        var decoded = jwt.verify(token, secret);
        var user = decoded.user;
        var business = req.headers["business"];
        var loggedInDetails = await User.findById(decoded.user).exec();
        var product = new Object();
        var items = [];
        var tax = [];
        var total = 0;
        var purchase = await Purchase.findById(req.body.bill).exec();
        if (purchase) {
            var products = req.body.items;
            items = purchase.items;
            if (products) {
                var product = await BusinessProduct.findOne({
                    part_no: products.part_no,
                    business: business,
                }).exec();
                var tax_info = await Tax.findOne({ tax: products.tax }).exec();
                if (tax_info) {
                    if (product) {
                        var quantity = parseInt(products.quantity);
                        var unit_base_price = parseFloat(products.unit_base_price);
                        var base = parseFloat(products.base);
                        var tax_slab = parseFloat(products.tax);
                        var amount_is_tax = products.amount_is_tax;
                        var amount = parseFloat(products.base);
                        var tax_amount = parseFloat(amount) - parseFloat(base);
                        var rate =
                            parseFloat(unit_base_price) + parseFloat(products.margin);
                        var unit_price = parseFloat(products.unit_price);
                        var discount = parseFloat(products.discount);
                        var tax_rate = tax_info.detail;
                        var amount_is_tax = "exclusive";
                        var lot = 1;

                        if (products.amount_is_tax == "exclusive") {
                            var tax_on_amount = amount;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = parseFloat(amount + t);
                                        tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2)),
                                        });
                                    } else {
                                        var t = tax_on_amount * (tax_info.rate / 100);
                                        amount = parseFloat(amount + t);
                                        tax.push({
                                            tax: tax_info.tax,
                                            tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2)),
                                        });
                                    }
                                }
                            }
                        }
                        var models = [];
                        if (products.models != null) {
                            models = products.models;
                        }

                        items.push({
                            item_status: products.item_status,
                            product: product.product,
                            part_no: products.part_no,
                            hsn_sac: products.hsn_sac,
                            part_category: products.part_category,
                            title: products.title,
                            quantity: quantity,
                            stock: products.quantity * lot,
                            sku: products.sku,
                            unit_base_price: unit_base_price,
                            unit_price: unit_price,
                            unit: products.unit,
                            lot: lot,
                            mrp: products.mrp,
                            rate: rate,
                            base: base,
                            tax_amount: tax_amount,
                            amount: parseFloat(products.amount),
                            models: models,
                            amount_is_tax: amount_is_tax,
                            sell_price: rate,
                            margin: products.margin,
                            discount: discount,
                            discount_type: products.discount_type,
                            discount_total: products.discount_total,
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: tax,
                            isProduct: true,
                            isOrderItem: products.isOrderItem,
                        });

                        // tax = [];
                    } else {
                        var quantity = parseInt(products.quantity);
                        var unit_base_price = parseFloat(products.unit_base_price);
                        var base = parseFloat(products.base);
                        var tax_slab = parseFloat(products.tax);
                        var amount_is_tax = products.amount_is_tax;
                        var amount = parseFloat(products.base);
                        var tax_amount = parseFloat(amount) - parseFloat(base);
                        var rate =
                            parseFloat(unit_base_price) + parseFloat(products.margin);
                        var unit_price = parseFloat(products.unit_price);
                        var discount = parseFloat(products.discount);
                        var tax_rate = tax_info.detail;
                        var lot = 1;

                        if (products.amount_is_tax == "exclusive") {
                            var tax_on_amount = amount;
                            if (tax_rate.length > 0) {
                                for (var r = 0; r < tax_rate.length; r++) {
                                    if (tax_rate[r].rate != tax_info.rate) {
                                        var t = tax_on_amount * (tax_rate[r].rate / 100);
                                        amount = parseFloat(amount + t);
                                        tax.push({
                                            tax: tax_rate[r].tax,
                                            rate: tax_rate[r].rate,
                                            amount: parseFloat(t.toFixed(2)),
                                        });
                                    } else {
                                        var t = tax_on_amount * (tax_info.rate / 100);
                                        amount = parseFloat(amount + t);
                                        tax.push({
                                            tax: tax_info.tax,
                                            tax_rate: tax_info.rate,
                                            rate: tax_info.rate,
                                            amount: parseFloat(t.toFixed(2)),
                                        });
                                    }
                                }
                            }
                        }

                        var models = [];
                        if (products.models != null) {
                            models = products.models;
                        }

                        items.push({
                            item_status: products.item_status,
                            product: null,
                            part_no: products.part_no,
                            hsn_sac: products.hsn_sac,
                            part_category: products.part_category,
                            title: products.title,
                            quantity: quantity,
                            stock: products.quantity * lot,
                            sku: products.sku,
                            unit_base_price: unit_base_price,
                            unit_price: unit_price,
                            // purchase_price: purchase_price,
                            unit: products.unit,
                            lot: lot,
                            mrp: products.mrp,
                            rate: rate,
                            base: base,
                            // tax_amount: _.sumBy(tax, x => x.amount),
                            tax_amount: tax_amount,
                            amount: parseFloat(products.amount),
                            models: models,
                            amount_is_tax: amount_is_tax,
                            sell_price: rate,
                            margin: products.margin,
                            discount: discount,
                            discount_type: products.discount_type,
                            discount_total: products.discount_total,
                            tax: tax_info.tax,
                            tax_rate: tax_info.rate,
                            tax_info: tax,
                            isProduct: false,
                            isOrderItem: products.isOrderItem,
                        });

                        // tax = [];
                    }
                } else {
                    res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Please check tax",
                        responseData: {},
                    });
                }

                await Purchase.findOneAndUpdate(
                    { _id: purchase._id },
                    {
                        $set: {
                            items: items,
                        },
                    },
                    { new: false },
                    async function (err, doc) {
                        if (err) {
                            res.status(422).json({
                                responseCode: 422,
                                responseMessage: "Server Error...",
                                responseData: err,
                            });
                        } else {
                            var purchase = await Purchase.findById(req.body.bill).exec();

                            var total = _.sumBy(purchase.items, (x) => x.amount);

                            var discount_total = 0;
                            var discount = 0;
                            var total_amount = total.toFixed(2);
                            if (purchase.bill_discount > 0) {
                                discount = parseFloat(purchase.bill_discount);
                                total_amount = total.toFixed(2);

                                if (!isNaN(discount) && discount > 0) {
                                    discount_total = total * (discount / 100);
                                    total_amount =
                                        total_amount - parseFloat(discount_total.toFixed(2));
                                }
                            }
                            var transaction_log = await TransactionLog.find({
                                source: purchase._id,
                                payment_status: "Success",
                            }).exec();
                            var paid_total = _.sumBy(transaction_log, (x) => x.paid_total);
                            var due_amount = Math.ceil(total_amount) - paid_total;

                            await Purchase.findOneAndUpdate(
                                { _id: purchase._id },
                                {
                                    $set: {
                                        due: due_amount,
                                        total_discount: discount_total,
                                        total: total_amount,
                                        subTotal: total.toFixed(2),
                                        updated_at: new Date(),
                                    },
                                },
                                { new: false },
                                async function (err, doc) {
                                    if (err) {
                                        res.status(422).json({
                                            responseCode: 422,
                                            responseMessage: "Server Error...",
                                            responseData: err,
                                        });
                                    } else {
                                    }
                                }
                            );
                        }
                    }
                );

                res.status(200).json({
                    responseCode: 200,
                    responseMessage: "Item Added Successfully",
                    responseData: {},
                });
            } else {
                res.status(400).json({
                    responseCode: 400,
                    responseMessage: "Please Add Items Details.",
                    responseData: {},
                });
            }
        } else {
            res.status(400).json({
                responseCode: 400,
                responseMessage: "Purchase not found",
                responseData: {},
            });
        }
    }
});
////////////////////////////////////////////////////////////////
module.exports = router