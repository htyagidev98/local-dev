var mongoose = require('mongoose'),
    express = require('express'),
    { ObjectId } = require('mongodb').ObjectID,
    router = express.Router(),
    config = require('./../../config'),
    bcrypt = require('bcrypt-nodejs'),
    jwt = require('jsonwebtoken'),
    aws = require('aws-sdk'),
    multerS3 = require('multer-s3'),
    uuidv1 = require('uuid/v1'),
    Validator = require('validatorjs'),
    multer = require('multer'),
    FCM = require('fcm-node'),
    request = require('request'),
    extract = require('mention-hashtag'),
    shortid = require('shortid'),
    child_process = require('child_process'),
    ffmpeg = require('ffmpeg'),
    formidable = require('formidable'),
    path = require('path'),
    moment = require('moment-timezone'),
    q = require('q'),
    fs = require('fs'),
    _ = require('lodash'),
    async = require("async"),
    XLSX = require('xlsx'),
    xlsxtojson = require("xlsx-to-json-lc"),
    // $ = require('cheerio'),
    assert = require('assert');

var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME
});

const xAccessToken = require('../../middlewares/xAccessToken');

var salt = bcrypt.genSaltSync(10);

const AppVersion = require('../../models/appVersion');
const User = require('../../models/user');
const BusinessTiming = require('../../models/businessTiming');
const Type = require('../../models/type');
const BusinessType = require('../../models/businessType');
const Category = require('../../models/category');
const Automaker = require('../../models/automaker');
const Model = require('../../models/model');
const ModelMedia = require('../../models/modelMedia');
const ModelReview = require('../../models/modelReview');
const Post = require('../../models/post');
const Follow = require('../../models/follow');
const Booking = require('../../models/booking');
const State = require('../../models/state');
const ProductCategory = require('../../models/productCategory');
const BusinessProduct = require('../../models/businessProduct');
const ProductImage = require('../../models/productImage');
const Country = require('../../models/country');
const BookmarkBusiness = require('../../models/bookmarkBusiness');
const BusinessOffer = require('../../models/businessOffer');
const BookmarkProduct = require('../../models/bookmarkProduct');
const BookmarkOffer = require('../../models/bookmarkOffer');
const BookmarkModel = require('../../models/bookmarkModel');
const Car = require('../../models/car');
const Asset = require('../../models/asset');
const Like = require('../../models/like');
const CarImage = require('../../models/carImage');
const Club = require('../../models/club');
const ClubMember = require('../../models/clubMember');
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
const BusinessServicePackage = require('../../models/businessServicePackage');
const BrandLike = require('../../models/brandLike');
const Notification = require('../../models/notification');
const Point = require('../../models/point');
const Story = require('../../models/story');
const UpdatePhone = require('../../models/updatePhone');
const ProfileView = require('../../models/profileViews');
const Battery = require('../../models/battery');
const BatteryBrand = require('../../models/batteryBrand');
const TyreSize = require('../../models/tyreSize');
const Referral = require('../../models/referral');
const Collision = require('../../models/collision');
const Detailing = require('../../models/detailing');
const Washing = require('../../models/washing');
const BookingCategory = require('../../models/bookingCategory');
const Service = require('../../models/service');
const Lead = require('../../models/lead');
const LeadRemark = require('../../models/leadRemark');
const Offer = require('../../models/offer');
const Package = require('../../models/package');
const UserPackage = require('../../models/userPackage');
const PackageUsed = require('../../models/packageUsed');
const Address = require('../../models/address');
const Management = require('../../models/management');
const CouponUsed = require('../../models/couponUsed');
const CarHistory = require('../../models/carHistory');
const Customization = require('../../models/customization');
const Gallery = require('../../models/gallery');
const ProductGallery = require('../../models/productGallery');
const ProductBrand = require('../../models/productBrand');
const ProductModel = require('../../models/productModel');
const Product = require('../../models/product');
const Tax = require('../../models/tax');
const ProductKeyword = require('../../models/productKeyword');
const QualityCheck = require('../../models/qualityCheck');
const Location = require('../../models/location');
const Bike = require('../../models/bike');


var secret = config.secret;

const fun = require('../../api/function');
const event = require('../../api/event');

router.post('/lead-remarks/binding/', async function (req, res, next) {
    await LeadRemark.find({})
        .cursor()
        .eachAsync(async (lead) => {
            Lead.findOneAndUpdate({ _id: lead.lead }, { $push: { remarks: lead._id } }, { new: false }, async function (err, doc) {
                if (err) {
                    return res.status(422).json({
                        responseCode: 422,
                        responseMessage: "Server Error",
                        responseData: err
                    });
                }
            });
        });

    res.json("success")
});

router.post('/variants/add/', async function (req, res, next) {
    // console.log(req.body.model)
    var model = await Model.findById(req.body.model).exec();
    if (model) {
        var a = req.body.variants;
        for (var i = 0; i < a.length; i++) {
            var data = {
                value: a[i].variant,
                variant: model.model + " " + a[i].variant,
                price: a[i].price,
                model: model._id,
                specification: {
                    length: a[i].length,
                    height: a[i].height,
                    width: a[i].width,
                    power: a[i].power,
                    fuel_type: _.startCase(a[i].fuel_type),
                    type: _.startCase(a[i].type),
                    wheels_size: a[i].tyres,
                    front_tyre_andamp_rim: a[i].tyres,
                    rear_tyre_andamp_rim: a[i].tyres,
                    arai_mileage: a[i].arai_mileage,
                }
            }

            Variant.create(data).then(function (v) {
                // console.log(v)
            });
        }
    }
    else {
        res.json("n")
    }
});


router.post('/variants/update/', async function (req, res, next) {
    var data = [];

    await Variant.find({})
        .cursor()
        .eachAsync(async (v) => {
            var model = await Model.findById(v.model).exec();
            var automaker = await Automaker.findById(model.automaker).exec();

            Variant.findOneAndUpdate({ _id: v.id }, {
                $set: {
                    _model: model.model,
                    automaker: automaker._id,
                    _automaker: automaker.maker,
                    segment: model.segment
                }
            }, { new: false }, async function (err, doc) {

            });
        });


    res.json(data)
});


router.get('/bikes/get', async function (req, res, next) {
    var data = [];

    request.get({ url: 'https://api.bikedekho.com/v1/pwa/allModelsWithStatus?_format=json&lang_code=en' }, function (err, httpResponse, body) {
        if (!err) {
            var resBody = JSON.parse(body);

            var main = resBody.mmv;
            for (var i = 0; i < main.length; i++) {

                var unFlattenedArray = [];
                unFlattenedArray.push(main[i].EM)
                unFlattenedArray.push(main[i].CM)
                unFlattenedArray.push(main[i].UM)
                const flattenedArray = [].concat(...unFlattenedArray);

                data.push({
                    automaker: main[i].oem,
                    models: flattenedArray,
                })

                Automaker.create({
                    maker: main[i].oem,
                    type: "bike",
                    logo: main[i].oemSlug + ".png",
                }).then(function (a) {
                    for (var k = 0; k < flattenedArray.length; k++) {
                        if (flattenedArray[k]) {
                            Model.create({
                                automaker: a._id,
                                model: flattenedArray[k].MN,
                                value: flattenedArray[k].MSN,
                                slug: flattenedArray[k].MS,
                                type: flattenedArray[k].tags,
                                price: {
                                    min: 0,
                                    max: 0
                                },
                            }).then(function (m) {
                            });
                        }
                    }
                });
            }

            res.status(200).json({
                responseCode: 200,
                responseMessage: "",
                responseData: data
            })
        }
    });
});


/*router.get('/bikes/variants/get', async function (req, res, next) {
    var data = [];
    var rs = [];
    await Model.find({type: {$ne: "car"}})
    .cursor()
    .eachAsync(async(model) => {
        data.push({
                    _model: model.value,
                    model: model.model,
                    slug: model.slug,
                })

        request.get({url:'https://www.bikedekho.com/yamaha/'+model.slug}, async function(err,httpResponse,body){ 
            if(!err){
                var data = [];

                var mySubString = body.substring(
                    body.lastIndexOf('"variantTable\":') + 15, 
                    body.lastIndexOf(',\"userReviews\"')
                );
                
                
                if(IsJsonString(mySubString) == true ){
                    Bike.create({
                        model: model._id,
                        data: JSON.parse(mySubString)
                    });
                }
            }
        });
    });

    res.json(data)
});*/


router.get('/bikes/variants/get', async function (req, res, next) {

    var data = []
    var body = _.uniqBy(data, 'variant');

    res.json({
        original: data.length,
        bodyLength: body.length,
        body: _.orderBy(body, 'automaker', 'desc')
    })
});

router.get('/d', async function (req, res, next) {
    var a = [1, 1, 1, 2, 3, 3, 4, 5, 5];
    var uniq = [];
    var dup = [];
    for (var i = 0; i <= a.length; i++) {
        if (a[i] == a[i + 1] || a[i] == a[i - 1]) {
            dup.push(a[i])
        }
        else {
            uniq.push(a[i])
        }
    }

    // console.log(uniq)
});

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = router