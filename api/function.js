const config = require('../config');
const Car = require('../models/car');
const User = require('../models/user');
const Category = require('../models/category');
const Automaker = require('../models/automaker');
const Model = require('../models/model');
const State = require('../models/state');
const Country = require('../models/country');
const Post = require('../models/post');
const PostMedia = require('../models/postMedia');
const Comment = require('../models/comment');
const Like = require('../models/like');
const Point = require('../models/point');
const Notification = require('../models/notification');
const ProfileView = require('../models/profileViews');
const PostView = require('../models/postView');
const Club = require('../models/club');
const ClubMember = require('../models/clubMember');
const Order = require('../models/order');
const BusinessOrder = require('../models/businessOrder');
const BusinessUser = require('../models/businessUser');
const OrderLine = require('../models/orderLine');
const Booking = require('../models/booking');
const Lead = require('../models/lead');
const ActivityLog = require('../models/activityLog');
const TransactionLog = require('../models/transactionLog');
const CarSellLead = require('../models/carSellLead');
const Referral = require('../models/referral');
const Management = require('../models/management');
const BusinessPlan = require('../models/businessPlan');
const SuitePlan = require('../models/suitePlan');
const BusinessProduct = require('../models/businessProduct');
const Invoice = require('../models/invoice');
const Address = require('../models/address');
const Purchase = require('../models/purchase')
var mongoose = require('mongoose');
//sumit..statments
const businessFunctions = require('../api/erpWeb/businessFunctions');
const Statements = require('../models/statements');
const WebNotification = require('../models/webNotification');
const Parchi = require('../models/parchi');
const io = require('../socket').getIo()



var moment = require('moment-timezone');
var FCM = require('fcm-node');
//var webpush = require('web-push');
var redis = require('redis');

//sumit..import
var ejs = require("ejs");
var pdf = require("html-pdf");
var path = require("path");
aws = require('aws-sdk');
const numtoWords = require('num-words');
const { ToWords } = require('to-words');
//var invNum = require('invoice-number');

/*webpush.setVapidDetails(
    'imchandankumar.24@gmail.com',
    config.publicKey,
    config.privateKey
);*/

const event = require('../api/event');
const Sales = require('../models/sales');

var client = redis.createClient({ host: 'localhost', port: 6379 });

module.exports = {
    activityLog: async function (activity) {
        ActivityLog.create(activity).then(async function (log) { });
    },
    setBusinessUser: async function (business, user) {
        if (business != null && user != null) {
            var check = await BusinessUser.find({ business: business, user: user }).count().exec();
            if (check == 0) {
                BusinessUser.create({
                    business: business,
                    user: user,
                    created_at: new Date(),
                    upated_at: new Date(),
                })
            }
        }
        return true;
    },

    getBusinessUsers: async function (business) {
        var users = [];
        await BusinessUser.find({ business: business })
            .cursor().eachAsync(async (list) => {
                users.push(list.user);
            });
        return users;
    },

    getBusinessOrderItems: async function (order, business, tz) {
        var items = [];
        // console.log("87 Function = " + business)

        await OrderLine.find({ order: order, business: business, issued: true, status: { $nin: ["Cancelled", "Returned"] } })
            .populate('product')
            .populate({ path: 'business', select: 'name email contact_no business_info address_info account_info' })
            .cursor().eachAsync(async (product) => {
                var product_id = null;
                var available = 0;
                // console.log("product: " + product.product)
                if (product.product) {
                    product_id = product.product._id;
                    available = product.product.stock.available
                }
                // console.log("100 Function = " + product._id)

                items.push({
                    _id: product._id,
                    id: product._id,
                    order: product.order,
                    product: product_id,
                    available: available,
                    category: product.category,
                    _category: product._category,
                    subcategory: product.subcategory,
                    _subcategory: product._subcategory,
                    product_brand: product.product_brand,
                    _brand: product._product_brand,
                    product_model: product.product_model,
                    _model: product._product_model,
                    source: product.source,
                    status: product.status,
                    part_no: product.part_no,
                    hsn_sac: product.hsn_sac,
                    unit: product.unit,
                    title: product.title,
                    sku: product.sku,
                    mrp: product.mrp,
                    selling_price: product.selling_price,
                    rate: product.rate,
                    quantity: product.quantity,
                    base: product.base,
                    amount: product.amount,
                    discount: product.discount,
                    discount_total: product.discount_total,
                    amount_is_tax: product.amount_is_tax,
                    tax_amount: product.tax_amount,
                    tax: product.tax,
                    tax_rate: product.tax_rate,
                    tax_info: product.tax_info,
                    issued: product.issued,
                    added_by_customer: product.added_by_customer,
                    business: product.business,
                    isInvoice: product.isInvoice,
                    isMarked: product.isMarked,
                    created_at: moment(product.created_at).tz(tz).format('lll'),
                    updated_at: moment(product.updated_at).tz(tz).format('lll'),
                });
            });
        // console.log("143 Function = " + business)

        return items;
    },

    isChatEnable: async function (business, tz) {
        var plans = await BusinessPlan.find({ business: business }).populate('suite').exec();
        if (plans) {
            var suite = _.map(plans, 'suite');
            for (var i = 0; i < suite.length; i++) {
                var serverTime = moment.tz(new Date(), tz);
                var bar = plans[i].created_at;
                bar.setDate(bar.getDate() + plans[i].validity);
                var e = bar;
                bar = moment.tz(bar, tz)

                var baz = bar.diff(serverTime);

                if (baz > 0) {
                    if (suite[i].chat == true) {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    bookingLog: async function (b, activity) {
        var date = new Date();
        var booking = await Booking.findOne({ _id: b }).exec();
        if (booking) {
            var log = {
                user: activity.user,
                name: activity.name,
                stage: activity.stage,
                activity: activity.activity,
                created_at: date,
                updated_at: date,

            };
            Booking.findOneAndUpdate({ _id: b }, { $push: { logs: log } }, { new: true }, async function (err, doc) { })
        }
    },
    bookingCancleLog: async function (b, activity, remark_ex) {
        var date = new Date();
        // console.log(remark_ex + " my working Working")
        var booking = await Booking.findOne({ _id: b }).exec();
        if (booking) {

            var log = {
                user: activity.user,
                name: activity.name,
                stage: activity.stage,
                activity: activity.activity,
                created_at: date,
                updated_at: date,
                reason: remark_ex.remark,
            };
            // var remark = {
            //     added_by: remark_ex.added_by,
            //     remark: remark_ex.remark,
            //     created_at: date,
            //     updated_at: date,


            // };
            // console.log(activity.activity, + " Activity Reason")
            // Booking.findOneAndUpdate({ _id: b }, { $push: { logs: log, remarks: remark } }, { new: false }, async function (err, doc) { })
            Booking.findOneAndUpdate({ _id: b }, { $push: { logs: log } }, { new: true }, async function (err, doc) { })
        }
    },

    productLog: async function (b, activity) {
        // console.log("Inside Function ")

        var remark = ""
        if (activity.remark) {
            remark = activity.remark;
        }
        var product = await BusinessProduct.findOne({ _id: b }).exec();
        if (product) {
            var logs = [];
            if (product.logs) {
                logs = product.logs;
            }
            logs.push({
                vendor_name: activity.vendor_name,
                quantity: activity.quantity,
                unit_price: activity.unit_price,
                price: activity.price,
                received_by: activity.received_by,
                purchase: activity.purchase,
                business: activity.business,
                activity: activity.activity,
                created_at: new Date()
            });

            await BusinessProduct.findOneAndUpdate({ _id: b }, { $set: { logs: logs } }, { new: true }, async function (err, doc) { })
        }
    },

    transactionLog: async function (booking, transaction) {
        var booking = await Booking.findById(booking).exec();
        if (!transaction) {
            transaction = 0;
        }

        TransactionLog.create({
            user: booking.user,
            activity: "Booking",
            source: booking._id,
            paid_total: transaction,
            total: booking.payment.total,
            payment_mode: booking.payment.payment_mode,
            payment_status: booking.payment.payment_status,
            order_id: booking.order_id,
            transaction_id: booking.payment.transaction_id,
            transaction_date: booking.payment.transaction_date,
            transaction_status: booking.payment.transaction_status,
            transaction_response: booking.payment.transaction_response,
            created_at: booking.updated_at,
            updated_at: booking.updated_at,
        });
    },

    orderTransactionLog: async function (order, transaction) {
        var order = await Order.findById(order).exec();
        if (!transaction) {
            transaction = 0;
        }

        TransactionLog.create({
            user: order.user,
            activity: "Order",
            source: order._id,
            paid_total: transaction,
            total: order.payment.total,
            payment_status: order.payment.payment_status,
            order_id: order.order_id,
            transaction_id: order.payment.transaction_id,
            transaction_date: order.payment.transaction_date,
            transaction_status: order.payment.transaction_status,
            transaction_response: order.payment.transaction_response,
            created_at: order.updated_at,
            updated_at: order.updated_at,
        });
    },

    getOrderTransaction: async function (order, business) {
        var paid_total = 0;
        var returned_total = 0;
        var returned_total = 0;
        var transactions = await TransactionLog.find({ source: order, business: business }).exec();
        var convenience_charges = 0;
        var businessOrder = await BusinessOrder.findOne({ order: order, business: business }).exec();
        if (businessOrder.payment.convenience_charges) {
            convenience_charges = Math.ceil(businessOrder.payment.convenience_charges)
        }

        var items = await OrderLine.find({ order: order, business: business, issued: true, status: { $nin: ['Cancelled'] } }).exec();
        var amount = _.sumBy(items, x => x.amount);

        if (transactions) {
            var received = _.filter(transactions, type => type.type == "recieved");
            received_total = parseFloat(_.sumBy(received, x => x.paid_total).toFixed(2));

            var returned = _.filter(transactions, type => type.type == "removed");
            returned_total = parseFloat(_.sumBy(returned, x => x.paid_total).toFixed(2));
        }
        var data = {
            transactions: transactions,
            paid_total: received_total,
            returned_total: returned_total,
        };

        return data;
    },

    orderLog: async function (o, status) {
        var order = await Order.findById(o).exec();
        await OrderLine.find({ order: order._id })
            .cursor()
            .eachAsync(async function (p) {
                OrderLine.findOneAndUpdate({ _id: p._id }, { $set: { status: status } }, { new: false }, async function (err, doc) {
                    OrderLine.findOneAndUpdate({ _id: p._id }, { $push: { log: { status: status, created_at: order.updated_at, updated_at: order.updated_at } } }, { new: false }, async function (err, doc) {
                        // console.log("push")
                    })
                })
            })

        await BusinessOrder.find({ order: order._id })
            .cursor()
            .eachAsync(async function (p) {
                BusinessOrder.findOneAndUpdate({ _id: p._id }, { $set: { status: status } }, { new: false }, async function (err, doc) {
                    BusinessOrder.findOneAndUpdate({ _id: p._id }, { $push: { log: { status: status, created_at: order.updated_at, updated_at: order.updated_at } } }, { new: false }, async function (err, doc) {
                    })
                })
            })
    },

    postView: async function (post, user, timezone) {
        var data = {
            post: post,
            user: user,
            timezone: timezone,
            created_at: new Date(),
            updated_at: new Date(),
        }
        var lastView = await PostView.findOne({ post: post, user: user, timezone: timezone }).sort({ created_at: -1 }).exec();
        if (lastView) {
            var a = moment(new Date());//now
            var b = moment(lastView.created_at);
            var diff = a.diff(b, 'hours');
            // console.log(diff)
            if (diff >= 8) {
                PostView.create(data).then(async function (pv) { });
            }
        } else {
            PostView.create(data).then(async function (pv) { });
        }
    },

    profileView: async function (profile, user, timezone) {
        var data = {
            profile: profile,
            user: user,
            timezone: timezone,
            created_at: new Date(),
            updated_at: new Date(),
        }
        if (profile != user) {
            var lastView = await ProfileView.findOne({ profile: profile, user: user, timezone: timezone }).sort({ created_at: -1 }).exec();
            if (lastView) {
                var a = moment(new Date());//now
                var b = moment(lastView.created_at);
                var diff = a.diff(b, 'hours');
                // console.log(diff)
                if (diff >= 8) {
                    ProfileView.create(data).then(async function (pv) { });
                }
            } else {
                ProfileView.create(data).then(async function (pv) { });
            }
        }
    },

    addMember: async function (user, model) {
        var club = await Club.findOne({ model: model }).exec();
        // console.log(club)
        var member = await ClubMember.findOne({ club: club._id, model: model, user: user }).count().exec();
        if (member == 0) {
            var data = {
                club: club._id,
                model: model,
                user: user,
                created_at: new Date(),
                updated_at: new Date()
            }
            await ClubMember.create(data).then(async function (member) {
                // console.log("new member added")
            })
        }
    },

    getBookingCarEagerCash: async function (b) {
        var careager_cash = 0;
        var booking = await Booking.findById(b).exec();
        if (booking.payment.careager_cash) {
            careager_cash = booking.payment.careager_cash;
            careager_cash = parseFloat(careager_cash.toFixed(2))
        }

        return careager_cash;
    },

    getCarEagerCash: async function (b) {
        var booking = await Booking.findById(b).populate('user').populate('business').exec();
        var discount = 0;
        if (booking.business.isCarEager == true) {
            var previous = await Point.findOne({ source: booking._id, type: "debit" }).exec();
            if (previous) {
                discount = previous.points;
            }
            else {
                var approved = booking.services;

                var labour = _.map(approved, 'labour');
                var labour_cost = booking.payment.labour_cost;
                /*
                for(var k=0; k<labour.length; k++)
                {
                    labour_cost = _.sumBy(labour[k], x => x.rate*x.quantity)+labour_cost;
                }*/

                var total_discount = booking.payment.discount_total;

                var careager_cash = booking.user.careager_cash;

                if (labour_cost > 0) {
                    var validation = true;
                    if (booking.insurance) {
                        if (booking.insurance.claim == true) {
                            validation = false
                        }
                    }

                    if (validation) {
                        if (booking.user.partner) {
                            if (booking.user.partner.partner == true) {
                                if (careager_cash < labour_cost) {
                                    discount = careager_cash;
                                    // console.log("drop-1")
                                }
                                else {
                                    discount = labour_cost;
                                }
                            }
                            else {
                                var coinsCalc = (labour_cost * 20 / 100);

                                if (careager_cash < coinsCalc) {
                                    discount = careager_cash;
                                }
                                else {
                                    discount = coinsCalc;
                                    if (coinsCalc < 0) {
                                        discount = 0
                                    }
                                }
                            }
                        }
                        else {
                            var coinsCalc = (labour_cost * 20 / 100);
                            if (careager_cash < coinsCalc) {
                                discount = careager_cash;
                            }
                            else {
                                discount = coinsCalc;
                                if (coinsCalc < 0) {
                                    discount = 0
                                }
                            }
                        }
                    }
                }
            }
        }
        return Math.ceil(discount)
    },

    getPackageDiscount: async function (data) {
        var discount = {};
        if (data.package) {
            if (data.claim == false) {
                // console.log("drop")
                var package = await UserPackage.findOne({ _id: data.package }).exec();
                if (package.status == true) {
                    if (package.car) {
                        var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
                    }
                    else {
                        var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service }).count().exec();
                    }

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
                                    }
                                    else {
                                        if (!packageDiscountOn.includes(data.service)) {
                                            discount = {
                                                discount: dis.discount,
                                                discount_type: "price"
                                            }
                                        }
                                    }
                                }
                            }
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
                                    }
                                    else if (dis.type == "fixed") {
                                        if (dis.limit > packageUsed) {
                                            packageDiscountOn.push(data.service)
                                            discount = {
                                                discount: dis.discount,
                                                discount_type: "fixed"
                                            }
                                        }
                                    }
                                    else {
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
                else {
                    if (package.booking.equals(data.booking)) {
                        var packageUsed = await PackageUsed.find({ package: data.package, user: package.user, label: data.service, car: data.car }).count().exec();
                        var serverTime = moment.tz(new Date(), data.tz);

                        var bar = package.created_at;
                        bar.setDate(bar.getDate() + package.validity);
                        bar = moment.tz(bar, data.tz)
                        var baz = bar.diff(serverTime);
                        // console.log(baz);
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
                                        }
                                        else {
                                            if (!packageDiscountOn.includes(data.service)) {
                                                discount = {
                                                    discount: dis.discount,
                                                    discount_type: "price"
                                                }
                                            }
                                        }
                                    }
                                }
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
                                        }
                                        else if (dis.type == "fixed") {
                                            if (dis.limit > packageUsed) {
                                                packageDiscountOn.push(data.service)
                                                discount = {
                                                    discount: dis.discount,
                                                    discount_type: "fixed"
                                                }
                                            }
                                        }
                                        else {
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

        return discount;
    },



    partnerCommission: async function (b) {
        var booking = await Booking.findById(b).populate('car').populate('user').populate('business').exec();
        var carEagerCoins = 0;
        var partnerCommission = 0;
        var c = 0
        if (booking.business.isCarEager == true) {
            var referralCommission = false;
            var referral = await Referral.findOne({ user: booking.user._id }).populate('owner').exec();

            var businessCommission = false

            if (referral) {
                if (referral.owner) {
                    if (referral.owner.account_info.type == "business") {
                        if (referral.owner.partner) {
                            if (referral.owner.partner.partner == true) {
                                referralCommission = true;
                                partnerCommission = parseFloat(referral.owner.partner.commission);
                            }
                        }
                        else {
                            businessCommission = true
                            partnerCommission = 10;
                        }
                    }

                    else if (referral.owner.account_info.type == "user") {
                        if (referral.owner.agent) {
                            if (referral.owner.agent.agent == true) {
                                referralCommission = true;
                                partnerCommission = parseFloat(referral.owner.agent.commission);
                            }
                        }
                    }

                    carEagerCoins = referral.owner.careager_cash;
                }
            }

            var data = {};
            var approved = _.filter(booking.services, customer_approval => customer_approval.customer_approval == true);
            var labour_cost = _.sumBy(approved, x => x.labour_cost);

            labour_cost = labour_cost - (labour_cost * 18 / 100);

            var commission = parseFloat(labour_cost * (partnerCommission / 100));

            c = commission;

            if (referralCommission == true) {

                var check = await Point.find({ user: referral.owner._id, tag: "ReferralCommission", source: booking._id }).exec();

                if (check.length > 0) {
                    var credit = _.filter(check, type => type.type == "credit");
                    var credit_commission = _.sumBy(credit, x => x.points);

                    var debit = _.filter(check, type => type.type == "debit");
                    var debit_commission = _.sumBy(debit, x => x.points);

                    var previous = credit_commission - debit_commission;

                    if (previous > commission) {
                        var amount = previous - commission;
                        c = amount;
                        data = {
                            user: referral.owner._id,
                            activity: "coin",
                            tag: "ReferralCommission",
                            source: booking._id,
                            sender: booking.user._id,
                            points: parseFloat(amount.toFixed(2)),
                            status: true,
                            type: "debit",
                            created_at: new Date(),
                            updated_at: new Date(),
                        };

                        carEagerCoins = carEagerCoins - amount;
                    }
                    else if (previous < commission) {
                        var amount = commission - previous;
                        c = amount;
                        data = {
                            user: referral.owner._id,
                            activity: "coin",
                            tag: "ReferralCommission",
                            source: booking._id,
                            sender: booking.user._id,
                            points: parseFloat(amount.toFixed(2)),
                            status: true,
                            type: "credit",
                            created_at: new Date(),
                            updated_at: new Date(),
                        };

                        carEagerCoins = carEagerCoins + amount;
                    }
                }
                else {
                    carEagerCoins = parseFloat(carEagerCoins.toFixed(2)) + parseFloat(commission.toFixed(2));

                    if (commission > 0) {
                        data = {
                            user: referral.owner._id,
                            activity: "coin",
                            tag: "ReferralCommission",
                            source: booking._id,
                            sender: booking.user._id,
                            points: parseFloat(commission.toFixed(2)),
                            type: "credit",
                            status: true,
                            created_at: new Date(),
                            updated_at: new Date(),
                        };
                    }

                    /*// console.log("3 \n")
                    // console.log("New commission: "+ amount+"\n")
                    // console.log(carEagerCoins)*/
                }

                if (data.points > 0) {
                    Point.create(data).then(async function (point) {
                        User.findOneAndUpdate({ _id: referral.owner._id }, { $set: { careager_cash: parseFloat(carEagerCoins.toFixed(2)) } }, { new: false }, async function (err, doc) {

                            event.transactionSms(referral.owner, commission.toFixed(2))

                        });
                    })
                }
            }
            else {
                if (businessCommission == true) {
                    var check = await Point.find({ user: referral.owner._id, tag: "ReferralCommission" }).count().exec();
                    if (check == 0) {
                        if (commission > 0) {
                            data = {
                                user: referral.owner._id,
                                activity: "coin",
                                tag: "ReferralCommission",
                                source: booking._id,
                                sender: booking.user._id,
                                points: parseFloat(commission.toFixed(2)),
                                type: "credit",
                                status: true,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };

                            if (data.points > 0) {
                                Point.create(data).then(async function (point) {
                                    User.findOneAndUpdate({ _id: referral.owner._id }, { $set: { careager_cash: parseFloat(carEagerCoins.toFixed(2)) } }, { new: false }, async function (err, doc) {

                                        event.transactionSms(referral.owner, commission.toFixed(2))
                                    });
                                })
                            }
                        }
                    }
                }
            }
        }
        return c;
    },


    invoice: async function (id, tz) {
        var new_invoice = await Invoice.findOne({ _id: id, status: "Active" })
            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email business_info" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email business_info" } })
            .populate({ path: 'car', select: '_id id title registration_no ic rc vin engine_no insurance_info' })
            .exec();

        if (new_invoice) {
            var car = null;
            var advisor = null;
            var customer_requirements = [];
            var address = null;
            var recording = ""
            if (new_invoice.car) {
                car = {
                    title: new_invoice.car.title,
                    _id: new_invoice.car._id,
                    id: new_invoice.car.id,
                    vin: new_invoice.car.vin,
                    engine_no: new_invoice.car.engine_no,
                    registration_no: new_invoice.car.registration_no,
                    ic_address: new_invoice.car.ic_address,
                    rc_address: new_invoice.car.rc_address,
                }
            }



            if (new_invoice.advisor) {
                var email = "";
                if (new_invoice.advisor.email) {
                    email = new_invoice.advisor.email;
                }
                advisor = {
                    name: new_invoice.advisor.name,
                    _id: new_invoice.advisor._id,
                    id: new_invoice.advisor.id,
                    contact_no: new_invoice.advisor.contact_no,
                    email: email,
                }
            }



            if (new_invoice.customer_requirements) {
                customer_requirements = new_invoice.customer_requirements;
            }

            if (new_invoice.address) {
                var address = await Address.findOne({ _id: new_invoice.address }).exec();
            }




            var show = {
                _id: new_invoice._id,
                id: new_invoice._id,
                car: car,
                user: {
                    name: new_invoice.user.name,
                    _id: new_invoice.user._id,
                    id: new_invoice.user.id,
                    contact_no: new_invoice.user.contact_no,
                    email: new_invoice.user.email,
                    business_info: new_invoice.user.business_info
                },
                business: {
                    name: new_invoice.business.name,
                    _id: new_invoice.business._id,
                    id: new_invoice.business.id,
                    contact_no: new_invoice.business.contact_no,
                    email: new_invoice.business.email,
                    business_info: new_invoice.business.business_info
                },
                advisor: advisor,
                booking: new_invoice.booking,
                services: new_invoice.services,
                status: _.startCase(new_invoice.status),
                invoice_no: new_invoice.invoice_no,
                job_no: new_invoice.job_no,
                booking_no: new_invoice.booking_no,
                address: address,
                payment: new_invoice.payment,
                due: new_invoice.due,
                invoice_type: new_invoice.invoice_type,
                odometer: new_invoice.odometer,
                delivery_date: moment(new_invoice.delivery_date).tz(tz).format('ll'),
                delivery_time: new_invoice.delivery_time,
                started_at: moment(new_invoice.started_at).tz(tz).format('lll'),
                created_at: moment(new_invoice.created_at).tz(tz).format('lll'),
                updated_at: moment(new_invoice.updated_at).tz(tz).format('lll'),
            };

            return show;

        }
    },

    deductCarEagerCash: async function (b) {
        var booking = await Booking.findById(b).populate('user').populate('business').exec();
        var data = {};
        var c = 0
        if (booking.payment.careager_cash) {
            var user_cash = booking.user.careager_cash;
            var careager_cash = booking.payment.careager_cash;
            var check = await Point.find({ source: booking._id }).count().exec();

            if (check == 0) {
                if (careager_cash > 0) {
                    data = {
                        user: booking.user._id,
                        activity: "booking",
                        tag: "usedInBooking",
                        source: booking._id,
                        sender: null,
                        points: parseFloat(careager_cash.toFixed(2)),
                        type: "debit",
                        created_at: new Date(),
                        updated_at: new Date(),
                    };
                }

                user_cash = parseFloat(user_cash.toFixed(2)) - parseFloat(careager_cash.toFixed(2));
                /*// console.log("3")
                // console.log("amount: "+amount)
                // console.log("user_cash: "+user_cash+"\n")*/
            }
            /*  else
              {
                  var credit = _.filter(check, type => type.type == "credit");
                  var credit_commission = _.sumBy(credit, x => x.points);
     
                  var debit = _.filter(check, type => type.type == "debit");
                  var debit_commission = _.sumBy(debit, x => x.points);
     
                  var previous = credit_commission-debit_commission;
     
     
                  // console.log("credit_commission: "+credit_commission)
                  // console.log("debit_commission: "+debit_commission)
                  // console.log("previous: "+previous+"\n")
     
                  if(previous > careager_cash)
                  {
                      var amount = previous-careager_cash;
                      c= amount;
                      data = {
                          user: booking.user._id,
                          activity: "booking",
                          tag: "usedInBooking",
                          source: booking._id,
                          sender: null,                           
                          points: parseFloat(amount.toFixed(2)),
                          status: true,
                          type: "debit",
                          created_at: new Date(),
                          updated_at: new Date(),
                      };
     
                      user_cash = user_cash-amount;
     
                      // console.log("1")
                      // console.log("amount: "+amount)
                      // console.log("user_cash: "+user_cash+"\n")
     
                    
                  }
                  else if(previous < careager_cash)
                  {
                      var amount = careager_cash+previous;
                      c= amount;
                      data = {
                          user: booking.user._id,
                          activity: "booking",
                          tag: "usedInBooking",
                          source: booking._id,
                          sender: null,                           
                          points: parseFloat(amount.toFixed(2)),
                          status: true,
                          type: "debit",
                          created_at: new Date(),
                          updated_at: new Date(),
                      };
     
                      user_cash = user_cash-amount;
                      // console.log("2")
                      // console.log("amount: "+amount)
                      // console.log("user_cash: "+user_cash+"\n")
                  }
              }*/
            if (careager_cash > 0) {
                Point.create(data).then(async function (point) {
                    User.findOneAndUpdate({ _id: booking.user._id }, { $set: { careager_cash: parseFloat(user_cash.toFixed(2)) } }, { new: false }, async function (err, doc) { });
                })
            }
        }
        return c;
    },
    deductCarEagerCashManual: async function (cash, b) {
        var booking = await Booking.findById(b).populate('user').populate('business').exec();
        var data = {};
        var c = 0
        if (cash) {
            var user_cash = booking.user.careager_cash;
            var careager_cash = cash;
            var check = await Point.find({ source: booking._id }).count().exec();

            if (check == 0) {
                if (careager_cash > 0) {
                    data = {
                        user: booking.user._id,
                        activity: "booking",
                        tag: "usedInBooking",
                        source: booking._id,
                        sender: null,
                        points: parseFloat(careager_cash.toFixed(2)),
                        type: "debit",
                        created_at: new Date(),
                        updated_at: new Date(),
                    };
                }

                user_cash = parseFloat(user_cash.toFixed(2)) - parseFloat(careager_cash.toFixed(2));
                /*// console.log("3")
                // console.log("amount: "+amount)
                // console.log("user_cash: "+user_cash+"\n")*/
                if (careager_cash > 0) {
                    await Point.create(data).then(async function (point) {
                        await User.findOneAndUpdate({ _id: booking.user._id }, { $set: { careager_cash: parseFloat(user_cash.toFixed(2)) } }, { new: false }, async function (err, doc) { });
                    })
                }
                return true;
            } else {
                return false;
            }

            // else{
            //     var credit = _.filter(check, type => type.type == "debit");
            //     oldDeduction =_.sumBy(credit, x => x.points);
            // }
            /*  else
              {
                  var credit = _.filter(check, type => type.type == "credit");
                  var credit_commission = _.sumBy(credit, x => x.points);
     
                  var debit = _.filter(check, type => type.type == "debit");
                  var debit_commission = _.sumBy(debit, x => x.points);
     
                  var previous = credit_commission-debit_commission;
     
     
                  // console.log("credit_commission: "+credit_commission)
                  // console.log("debit_commission: "+debit_commission)
                  // console.log("previous: "+previous+"\n")
     
                  if(previous > careager_cash)
                  {
                      var amount = previous-careager_cash;
                      c= amount;
                      data = {
                          user: booking.user._id,
                          activity: "booking",
                          tag: "usedInBooking",
                          source: booking._id,
                          sender: null,                           
                          points: parseFloat(amount.toFixed(2)),
                          status: true,
                          type: "debit",
                          created_at: new Date(),
                          updated_at: new Date(),
                      };
     
                      user_cash = user_cash-amount;
     
                      // console.log("1")
                      // console.log("amount: "+amount)
                      // console.log("user_cash: "+user_cash+"\n")
     
                    
                  }
                  else if(previous < careager_cash)
                  {
                      var amount = careager_cash+previous;
                      c= amount;
                      data = {
                          user: booking.user._id,
                          activity: "booking",
                          tag: "usedInBooking",
                          source: booking._id,
                          sender: null,                           
                          points: parseFloat(amount.toFixed(2)),
                          status: true,
                          type: "debit",
                          created_at: new Date(),
                          updated_at: new Date(),
                      };
     
                      user_cash = user_cash-amount;
                      // console.log("2")
                      // console.log("amount: "+amount)
                      // console.log("user_cash: "+user_cash+"\n")
                  }
              }*/

        }
        return c;
    },
    //USE CASHBACK
    addPoints: async function (data) {
        data.created_at = new Date();
        data.updated_at = new Date();
        data.type = "credit";
        var user = await User.findOne({ _id: data.user }).exec();
        var carEagerCoins = user.careager_cash;
        carEagerCoins = Math.ceil(carEagerCoins) + Math.ceil(data.points);
        return new Promise((resolve, reject) => {
            if (data.points > 0) {
                if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10) {
                    businessFunctions.logs("DEBUG: Create Data using addPoints() function in function.js " + " " + "For User :" + data.user)
                }
                Point.create(data).then(async function (point) {
                    User.findOneAndUpdate({ _id: data.user }, { $set: { careager_cash: carEagerCoins } }, { new: false }, async function (err, doc) {
                        event.transactionSms(user, data.points)
                        if (Log_Level == 4 || Log_Level == 6 || Log_Level == 8 || Log_Level == 10) {
                            businessFunctions.logs("DEBUG: Update Data addPoints() function in function.js " + " " + "For User :" + data.user + "  " + "Data :" + carEagerCoins)
                        }
                    });
                });

                var notify = {
                    sender: data.sender,
                    receiver: [data.user],
                    points: data.points,
                    activity: data.activity,
                    tag: data.tag,
                    source: data.source
                };

                resolve(module.exports.newNotification(notify));
            }
        });
    },

    //Abhinav Coins credit Service
    addServicePoints: async function (data) {
        data.created_at = new Date();
        data.updated_at = new Date();
        data.type = "credit";
        var user = await User.findOne({ _id: data.user }).exec();
        var carEagerCoins = user.careager_cash;
        carEagerCoins = Math.ceil(carEagerCoins) + Math.ceil(data.points);
        carEagerCoins = carEagerCoins.toFixed(2);
        return new Promise((resolve, reject) => {
            if (data.points > 0) {
                Point.create(data).then(async function (point) {
                    User.findOneAndUpdate({ _id: data.user }, { $set: { careager_cash: carEagerCoins } }, { new: false }, async function (err, doc) {
                        event.transactionSms(user, data.points)
                    });
                });

                var notify = {
                    sender: data.sender,
                    // sender: "5bfec47ef651033d1c99fbca",
                    receiver: [data.user],
                    // receiver: ["5f4505ddcbee7c28ccdda86c"],
                    points: data.points,
                    activity: data.activity,
                    tag: data.tag,
                    source: data.source
                };

                resolve(module.exports.newNotification(notify));
                event.carEagerCash(data.points)
                // console.log("Event is called CashBack Add" + data)
            }
        });
    },

    deductPoints: async function (data) {
        data.created_at = new Date();
        data.updated_at = new Date();
        data.type = "debit";
        var user = await User.findOne({ _id: data.user }).exec();
        var carEagerCoins = user.careager_cash;
        if (carEagerCoins >= data.points) {
            carEagerCoins = carEagerCoins - data.points;
            return new Promise((resolve, reject) => {
                if (data.points > 0) {
                    Point.create(data).then(async function (point) {
                        User.findOneAndUpdate({ _id: data.user }, { $set: { careager_cash: carEagerCoins } }, { new: false }, async function (err, doc) { });
                    })

                    var notify = {
                        sender: data.sender,
                        receiver: [data.user],
                        points: data.points,
                        activity: data.activity,
                        tag: data.tag,
                        source: data.source
                    };
                    resolve(module.exports.newNotification(notify));
                    // event.carEagerCash(carEagerCoins)
                    // console.log("Event is called CashBack deduct" + data)
                }
            });
        }
    },

    newNotification: async function (data) {
        if (!data.body) {
            data.body = "";
        }

        var sender = null;
        if (data.sender) {
            sender = await User.findOne({ _id: "5bfec47ef651033d1c99fbca" }).exec();
        }
        return new Promise((resolve, reject) => {
            data.receiver.forEach(async function (receiver) {
                var user = await User.findOne({ _id: receiver }).exec();
                if (receiver != data.sender) {
                    if (data.tag == "welcome") {
                        data.title = "CarEager Wallet";
                        data.body = data.points + " CarEager cash added to your account";
                    }
                    else if (data.tag == "referNEarn") {
                        data.title = "CarEager Wallet";
                        data.body = data.points + " CarEager cash added to your account";
                    }
                    else if (data.tag == "referralCommission") {
                        data.title = "CarEager Wallet";
                        data.body = data.points + " CarEager cash added to your account";
                    }
                    else if (data.tag == "commission") {
                        data.title = "CarEager Wallet";
                        data.body = data.points + " CarEager cash added to your account";
                    }
                    else if (data.tag == "addLocalBusiness") {
                        data.title = "CarEager Wallet";
                        data.body = data.points + " CarEager cash added to your account";
                    }
                    else if (data.tag == "post") {
                        data.title = "CarEager Wallet";
                        data.body = data.points + " CarEager Cash added to your account";
                    }
                    else if (data.tag == "credit") {
                        data.title = "CarEager Wallet";
                        data.body = data.points + " CarEager Cash deposited in your CarEager Account";
                    }
                    else if (data.tag == "debit") {
                        data.title = "CarEager Wallet";
                        data.body = data.points + " CarEager Cash has been debited from your account";
                    }
                    else if (data.tag == "mention") {
                        data.title = "CarEager";
                        data.body = "You are mentioned in a post by " + sender.name;
                    }
                    else if (data.tag == "like") {
                        data.title = "CarEager";
                        data.body = sender.name + " liked your post";
                    }
                    else if (data.tag == "comment") {
                        data.title = "CarEager";
                        data.body = sender.name + " commented on your post";
                    }
                    else if (data.tag == "mentionInComment") {
                        data.title = "CarEager";
                        data.body = "You are mentioned in a comment by " + sender.name
                    }
                    else if (data.tag == "follow") {
                        data.title = "CarEager";
                        data.body = sender.name + " followed you";
                    }
                    else if (data.tag == "businessReview") {
                        data.title = "CarEager";
                        data.body = data.points + " CarEager cash added to your account";
                    }
                    else if (data.tag == "review") {
                        data.title = "CarEager";
                        data.body = sender.name + " rated you " + data.points + " star";
                    }
                    else if (data.tag == "modelReview") {
                        data.title = "CarEager Wallet";
                        data.body = data.points + " CarEager cash added to your account";
                    }
                    else if (data.tag == "assigned") {
                        var lead = await Lead.findOne({ '_id': data.source })
                            .populate({ path: 'assignee', populate: { path: 'user', select: "_id id name contact_no" } })
                            .exec();

                        data.title = "New Lead";
                        data.body = _.startCase(_.toLower(lead.name)) + "/" + (lead.contact_no);
                    }
                    else if (data.tag == "RemarkUpdate") {
                        var lead = await Lead.findOne({ '_id': data.source })
                            .populate({ path: 'assignee', populate: { path: 'user', select: "_id id name contact_no" } })
                            .exec();

                        data.title = "New Remark Update";
                        data.body = _.startCase(_.toLower(lead.name)) + "/" + (lead.contact_no);
                    }

                    else if (data.tag == "Rework") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();


                        data.title = "Booking Rework";
                        data.body = "#" + booking.booking_no + " / " + booking.user.name + " / " + booking.user.contact_no;
                    }
                    else if (data.tag == "newBooking") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', select: "_id id name contact_no" })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        var services = [];
                        booking.services.forEach(function (service) {
                            services.push(service.service)
                        });

                        data.title = "New Service - " + sender.name;
                        data.body = booking.car.title + "/" + booking.car.registration_no;
                    }
                    else if (data.tag == "newPackage") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user,', select: "_id id name contact_no" })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        var services = [];

                        booking.services.forEach(function (service) {
                            services.push(service.service)
                        });

                        data.title = "New Package - " + sender.name;
                        data.body = booking.car.title + " - " + services.toString();
                    }
                    else if (data.tag == "bookingReschedule") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "Booking Reschedule";
                        data.body = booking.car.title + " / " + booking.car.registration_no;
                    }

                    else if (data.tag == "bookingRejected") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "#" + booking.booking_no + " has been rejected.";
                    }
                    else if (data.tag == "bookingConfirmation") {
                        data.title = sender.name + " confirmed your service appointment";
                    }
                    else if (data.tag == "bookingApproved") {
                        data.title = sender.name + " confirmed your service estimation";
                    }
                    else if (data.tag == "userCancelledBooking") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "Booking Cancelled";
                        data.body = booking.car.title + " / " + booking.car.registration_no;
                    }
                    else if (data.tag == "BookingCancelled") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "Booking Cancelled";
                        data.body = booking.car.title + " / " + booking.car.registration_no;
                    }
                    else if (data.tag == "OrderCancelled") {
                        data.title = "Your order has been cancelled";
                    }
                    else if (data.tag == "postDelete") {
                        data.title = data.points + " CarEager cash deducted from your account";
                    }
                    else if (data.tag == "estimation") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "New Service Estimation is waiting for your approval";
                    }
                    else if (data.tag == "EstimateRequested") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "Estimate Required";
                        data.body = booking.user.name + " / " + booking.car.title;
                    }
                    else if (data.tag == "leadBooking") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "Estimate Required";
                        data.body = booking.user.name + " / " + booking.car.title;
                    }
                    else if (data.tag == "EstimateSendUser") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();


                        data.title = "New Estimate";
                        data.body = booking.user.name + " / " + booking.car.title;
                    }

                    else if (data.tag == "EstimateSendManager") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();


                        data.title = "Estimate Sent";
                        data.body = booking.user.name + " / " + booking.car.title;
                    }
                    else if (data.tag == "EstimateInitiated") {
                        // console.log("Booking Id =" + data.source)
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();


                        data.title = "Estimate Initiated By " + booking.advisor.name;
                        data.body = booking.user.name + " / " + booking.car.title;
                    }
                    else if (data.tag == "Approval") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "Estimate Required";
                        data.body = booking.user.name + " / " + booking.car.title;
                    }
                    else if (data.tag == "Approved") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "Estimate Approved";
                        data.body = booking.user.name + " / " + booking.car.title;
                    }
                    else if (data.tag == "FollowUpBooking") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'advisor', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "Estimate Initiated By " + booking.advisor.name;
                        data.body = booking.user.name + " / " + booking.user.contact_no;
                    }
                    else if (data.tag == "FollowUpJob") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "Follow-Up Customer Arrived";
                        data.body = booking.user.name + " / " + booking.user.contact_no;
                    }
                    else if (data.tag == "CustomerApproval") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "ESTIMATE REQUIRED";
                        data.body = booking.user.name + " / " + booking.car.title;
                    }
                    else if (data.tag == "bookingCompleted") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = "Booking #" + booking.booking_no + " has been completed";
                        data.body = data.points + " CarEager cash added to your account";
                    }
                    else if (data.tag == "JobInititated") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = booking.business.name;
                        data.body = "Job Initiated: " + booking.car.title + " - " + booking.car.registration_no;
                    }

                    else if (data.tag == "ApprovalAwaited") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = booking.business.name;
                        data.body = "Your Approval Awaited: " + booking.car.title + " - " + booking.car.registration_no;

                    }

                    else if (data.tag == "StartWork") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = booking.business.name;
                        data.body = "In-Process: " + booking.car.title + " - " + booking.car.registration_no;

                    }


                    else if (data.tag == "In-Process") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = booking.user.name;
                        data.body = "Approved: " + booking.car.title + " - " + booking.car.registration_no;

                    }

                    else if (data.tag == "CompleteWork") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = booking.business.name;
                        data.body = "Your car is ready for the Quality Check."
                    }

                    else if (data.tag == "Ready") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = booking.business.name;
                        data.body = "Car Ready: " + booking.car.title + " - " + booking.car.registration_no;
                    }

                    else if (data.tag == "Invoice") {
                        var booking = await Booking.findOne({ '_id': data.source })
                            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no" } })
                            .populate({ path: 'car', select: '_id id title registration_no' })
                            .exec();

                        data.title = booking.business.name;
                        data.body = "Invoice Generated: " + booking.car.title + " - " + booking.car.registration_no;
                    }

                    else if (data.tag == "newOrder") {
                        data.title = sender.name + " New Order has been placed";
                    }

                    else if (data.tag == "CarListApproved") {
                        var car = await Car.findById(data.source).exec();
                        data.title = car.title + " has been Approved";
                    }
                    else if (data.tag == "CarListRejected") {
                        var car = await Car.findById(data.source).exec();
                        data.title = car.title + " has been Rejected";
                    }
                    else if (data.tag == "Services") {
                        data.title = "CarEager Wallet";
                        data.body = data.points + " CarEager cash of Service Charges added to your account";
                        // console.log("My New Working")
                    }

                    data.created_at = new Date();
                    data.updated_at = new Date();
                    data.user = user._id;



                    if (data.title) {
                        Notification.create(data).then(async function (notification) {
                            // console.log(notification)
                            var fcmCli = new FCM(config.server_key);
                            if (user) {
                                if (user.device) {
                                    user.device.forEach(function (device) {
                                        var fcmId = device.fcmId;
                                        if (device.deviceType == "Android") {
                                            var fcmId = device.fcmId;
                                            var payloadOK = {
                                                to: fcmId,
                                                data: {
                                                    title: notification.title,
                                                    body: notification.body,
                                                    sound: "default",
                                                    badge: "1",
                                                    source: notification.source,
                                                    tag: notification.tag,

                                                    activity: notification.activity
                                                },
                                                priority: 'high',
                                                content_available: true,
                                            };

                                            var payloadError = {
                                                to: fcmId, //invalid registration token
                                                data: { //some data object (optional)
                                                    title: notification.title,
                                                    body: notification.body,
                                                    sound: "default",
                                                    badge: "1",
                                                    source: notification.source,
                                                    tag: notification.tag,
                                                    activity: notification.activity
                                                },
                                                content_available: true,
                                            };
                                        }
                                        else {
                                            var fcmId = device.fcmId;
                                            var payloadOK = {
                                                to: fcmId,
                                                data: { //some data object (optional)
                                                    title: notification.title,
                                                    body: notification.body,
                                                    sound: "default",
                                                    badge: "1",
                                                    source: notification.source,
                                                    tag: notification.tag,
                                                    activity: notification.activity
                                                },
                                                notification: {
                                                    title: notification.title,
                                                    body: notification.body,
                                                    sound: "default",
                                                    badge: "1",
                                                    source: notification.source,
                                                    tag: notification.tag,
                                                    activity: notification.activity
                                                },
                                                priority: 'high',
                                                content_available: true,
                                            };
                                            var payloadError = {
                                                to: fcmId, //invalid registration token
                                                data: { //some data object (optional)
                                                    title: notification.title,
                                                    body: notification.body,
                                                    sound: "default",
                                                    badge: "1",
                                                    source: notification.source,
                                                    tag: notification.tag,
                                                    activity: notification.activity
                                                },
                                                notification: {
                                                    title: notification.title,
                                                    body: notification.body,
                                                    sound: "default",
                                                    badge: "1",
                                                    source: notification.source,
                                                    tag: notification.tag,
                                                    activity: notification.activity
                                                },
                                                priority: 'high',
                                                content_available: true,
                                            };
                                        }

                                        var callbackLog = function (sender, err, res) {
                                            // console.log("\n__________________________________")
                                            // console.log("\t" + sender);
                                            // console.log("----------------------------------")
                                            // console.log("err=" + err);
                                            // console.log("res=" + res);
                                            // console.log("----------------------------------\n>>>");
                                        };

                                        function sendOK() {
                                            fcmCli.send(payloadOK, function (err, res) {
                                                callbackLog('sendOK', err, res);
                                            });
                                        };

                                        function sendError() {
                                            fcmCli.send(payloadError, function (err, res) {
                                                callbackLog('sendError', err, res);
                                            });
                                        };

                                        sendOK();
                                    });
                                }
                            }
                        });
                    }
                }
            });
        });
    },

    fiscalyear: async function (data) {
        // console.log(data)
        if (data.with_tax == true) {
            var fiscalyear = {};
            var today = new Date();
            var thisFullYear = today.getFullYear();
            var nextFullYear = today.getFullYear() + 1;

            today.setMonth(today.getMonth());

            if ((today.getMonth() + 1) <= 3) {
                fiscalyear = (today.getFullYear() - 1) + "-" + thisFullYear.toString().slice(-2);
            }
            else {
                fiscalyear = today.getFullYear() + "-" + nextFullYear.toString().slice(-2);
            }


            if (data.last_invoice == "") {
                var invoice = fiscalyear + "/" + data.position;
            }
            else {
                var ls = data.last_invoice.split('/');
                if (ls[0] == fiscalyear) {
                    if (ls[1]) {
                        var invoice = fiscalyear + "/" + (parseInt(ls[1]) + 1);
                    }
                    else {
                        var invoice = fiscalyear + "/" + data.position;
                    }
                }
                else {
                    var invoice = fiscalyear + "/1";
                }
            }
        }
        else if (data.type == 'quotation') {
            var fiscalyear = {};
            var today = new Date();
            var thisFullYear = today.getFullYear();
            var nextFullYear = today.getFullYear() + 1;

            today.setMonth(today.getMonth());

            if ((today.getMonth() + 1) <= 3) {
                fiscalyear = (today.getFullYear() - 1) + "-" + thisFullYear.toString().slice(-2);
            }
            else {
                fiscalyear = today.getFullYear() + "-" + nextFullYear.toString().slice(-2);
            }


            if (data.last_invoice == "") {
                var invoice = fiscalyear + "/" + data.position;
            }
            else {
                var ls = data.last_order.split('/');
                if (ls[0] == fiscalyear) {
                    if (ls[1]) {
                        var invoice = fiscalyear + "/" + (parseInt(ls[1]) + 1);
                    }
                    else {
                        var invoice = fiscalyear + "/" + data.position;
                    }
                }
                else {
                    var invoice = fiscalyear + "/1";
                }
            }
        }
        else {
            var invoice = data.position;
            // console.log("Data = ")
            /*if(data.last_invoice==""){
                var invoice = data.position;
            }
            else
            {
                var invoice = data.position;
            }*/
        }
        return { invoice: invoice }
    },


    webNotification: async function (activity, data, contact) {
        let time = new Date().toLocaleTimeString({ timeZone: 'Asia/Kolkata' });
        //  // console.log({b});
        var notificationData = {}
        if (activity == "Lead") {
            var title = 'New Lead';
            var bodyData = '[' + title + "] - " + data.source + " - " + data.name + " - " + data.contact_no;
            // console.log({ bodyData });
            notificationData = {
                // leadSource : data._id,
                name: data.name,
                contact_no: data.contact_no,
                type: activity,
                source: data._id,
                business: data.business,
                leadSource: data.source,
                assignee: data.assignee,
                title: title,
                body: bodyData,
                status: 'Unread',
                created_at: new Date(),
                updated_at: new Date()

            }
            // io.emit('leadNotify', `${bodyData} ${time}`);
            io.emit('Notify', { activity: "Lead" });
        }
        else if (activity == "Booking") {
            // console.log("in booking...");
            var title = 'New Booking';
            var bodyData = '[' + 'Booking ' + data.status + '] - ' + data.user.name + " - " + data.car.title + " - " + data.user.contact_no;

            // console.log("Body Data = " + bodyData)
            notificationData = {
                source: data._id,
                body: bodyData,
                business: data.business,
                name: data.user.name,
                contact_no: data.user.contact_no,
                title: title,
                type: activity,
                model: data.car.title,
                advisor: data.advisor,
                assignee: data.assignee,
                carStatus: data.status,
                created_at: new Date(),
                updated_at: new Date()
            }
            io.emit('Notify', { activity: "Booking" });
        }


        else if (activity == 'new chat') {
            // console.log("Sumit" + contact);
            var lead = await Lead.findOne({ contact_no: contact }).exec();
            var title = 'New Message';
            var bodyData = '[' + 'New Message Whatsapp' + '] - ' + lead.name + " - " + lead.contact_no + " - " + data.client;

            notificationData = {
                source: lead._id,
                body: bodyData,
                business: lead.business,
                name: lead.name,
                contact_no: lead.contact_no,
                title: title,
                type: activity,
                assignee: lead.assignee,
                created_at: new Date(),
                updated_at: new Date()
            }
            io.emit('Notify', { activity: "new chat" });






        }











        else if (activity == "ConfirmedBooking") {
            var title = 'Booking';
            var date = new Date();
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2)

            var bookingData = await Booking.find({ advisor: data.user, business: data.business, date: { $gte: from, $lte: to }, }).populate('advisor').exec()

            if (bookingData.length > 0) {
                var bodyData = bookingData[0].advisor.name + " has a booking " + bookingData[0].convenience + ' for tomorrow';
                notificationData = {
                    source: bookingData[0]._id,
                    body: bodyData,
                    business: data.business,
                    title: title,
                    type: activity,
                    advisor: data.user,
                    created_at: new Date(),
                    updated_at: new Date()
                }
                io.emit('Notify', { activity: "ConfirmedBooking" });

            }
        }


        else if (activity == "TodayBooking") {
            var title = 'Booking';
            var date = new Date();
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2)

            var bookingData = await Booking.find({ advisor: data.user, business: data.business, date: { $gte: from, $lte: to }, }).populate('advisor').exec()


            if (bookingData.length > 0) {
                bodyData = bookingData[0].advisor.name + " has a booking " + bookingData[0].convenience + ' for today';
                notificationData = {
                    source: bookingData[0]._id,
                    body: bodyData,
                    business: data.business,
                    title: title,
                    type: activity,
                    advisor: data.user,
                    created_at: new Date(),
                    updated_at: new Date()
                }
                io.emit('Notify', { activity: "TodayBooking" });

            }
        }

        else if (activity == "FollowUp") {
            var date = new Date();
            var from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
            var to = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2)
            //    var assigneeData = await Lead.find({assignee:data.user}).populate({ path: 'assignee', select: 'name contact_no' }).exec();
            //return res.json(ass);
            var leads = await Lead.find({ assignee: data.user, business: data.business, 'follow_up.date': { $gte: from, $lte: to } }).populate('assignee').exec()
            // console.log(leads.length);
            title = 'Lead';
            if (leads.length > 0) {
                var bodyData = leads[0].assignee.name + " have " + leads.length + ' Follow-ups for today';
                notificationData = {
                    source: leads[0]._id,
                    body: bodyData,
                    business: data.business,
                    title: title,
                    type: activity,
                    assignee: data.user,
                    created_at: new Date(),
                    updated_at: new Date()
                }
                io.emit('Notify', { activity: "FollowUp" });
            }
        }
        //Sumit... Sales & Purchase

        else if (activity == 'Quotation Request') {
            var businessData = await User.findOne({ _id: mongoose.Types.ObjectId(data.business) }).exec();
            //console.log("Sumithgf");     

            var title = 'Sales';
            var bodyData = `[Quotation Request]- ${businessData.name} has requested prices. `// '['+'Quotation Request' + '] - ' + lead.name + " - " + lead.contact_no + " - " + data.client;

            var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.vendor })
                .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()
            if (storeAdmin) {
                var storeBoy = storeAdmin.user
            }
            else {
                storeBoy = data.vendor
            }
            notificationData = {
                source: data._id,
                body: bodyData,
                business: data.vendor,
                vendor: data.quotation,
                advisor: storeBoy,
                title: title,
                type: activity,
                created_at: new Date(),
                updated_at: new Date()

            }

            io.emit('Notify', { activity: "Quotation Request" });





        }

        else if (activity == 'Quotation Update') {
            console.log("data" + data.vendor);
            var vendorDetail = await User.findOne({ _id: mongoose.Types.ObjectId(data.vendor) })
                //.populate({ path: 'user', select: 'name contact_no address _id' })
                //.populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
                .exec()
            var title = 'Sales';
            var bodyData = `[Quotation Updated] ${vendorDetail.name} has updated the prices`


            var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.business })
                .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

            if (storeAdmin) {
                var storeBoy = storeAdmin.user
            }
            else {
                storeBoy = data.business
            }
            notificationData = {
                source: data._id,
                body: bodyData,
                business: data.business,
                vendor: data.vendor,
                advisor: storeBoy,
                title: title,
                type: activity,
                created_at: new Date(),
                updated_at: new Date()

            }

            io.emit('Notify', { activity: "Quotation Update" });

        }

        else if (activity == 'New Order') {
            //console.log("data"+data.vendor);      
            var vendorDetail = await User.findOne({ _id: mongoose.Types.ObjectId(data.business) })
                .populate({ path: 'user', select: 'name contact_no address _id' })
                .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
                .exec()
            var title = 'Sales';
            var bodyData = `[New Order] A new order from ${vendorDetail.name} amounting to ${data.total_amount}`


            var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.vendor })
                .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

            if (storeAdmin) {
                var storeBoy = storeAdmin.user
            }
            else {
                storeBoy = data.vendor
            }

            notificationData = {
                source: data._id,
                body: bodyData,
                business: data.vendor,
                vendor: data.business,
                advisor: storeBoy,
                title: title,
                type: activity,
                created_at: new Date(),
                updated_at: new Date()

            }

            io.emit('Notify', { activity: "New Order" });

        }



        else if (activity == 'Purchase Order') {
            //console.log("data"+data.vendor);      
            var vendorDetail = await User.findOne({ _id: mongoose.Types.ObjectId(data.business) })
                .populate({ path: 'user', select: 'name contact_no address _id' })
                .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
                .exec()
            var title = 'Sales';
            var bodyData = `[Purchase Order] A new order from ${vendorDetail.name} amounting to ${data.total_amount}`


            var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.vendor })
                .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

            if (storeAdmin) {
                var storeBoy = storeAdmin.user
            }
            else {
                storeBoy = data.vendor
            }
            notificationData = {
                source: data._id,
                body: bodyData,
                business: data.vendor,
                vendor: data.business,
                advisor: storeBoy,
                title: title,
                type: activity,
                created_at: new Date(),
                updated_at: new Date()

            }

            io.emit('Notify', { activity: "Purchase Order" });

        }



        else if (activity == 'Order Received') {

            //console.log("data"+data.vendor);      
            var vendorDetail = await User.findOne({ _id: mongoose.Types.ObjectId(data.business) })
                .populate({ path: 'user', select: 'name contact_no address _id' })
                .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
                .exec()
            var title = 'Sales';
            var bodyData = `[Order Delivered] ${vendorDetail.name} has received the order #${data.order_no}.`


            var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.vendor })

                .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

            if (storeAdmin) {
                var storeBoy = storeAdmin.user
            }
            else {
                storeBoy = data.vendor
            }

            notificationData = {

                source: data._id,
                body: bodyData,
                business: data.vendor,
                vendor: data.business,
                advisor: storeBoy,
                title: title,
                type: activity,
                created_at: new Date(),
                updated_at: new Date()

            }

            io.emit('Notify', { activity: "Order Received" });

        }


        else if (activity == 'Order Shipped') {
            //console.log("data"+data.vendor);      
            var vendorDetail = await User.findOne({ _id: mongoose.Types.ObjectId(data.business) })
                .populate({ path: 'user', select: 'name contact_no address _id' })
                .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
                .exec()
            var title = 'Sales';
            var bodyData = `[Order Shipped] ${vendorDetail.name} has shipped the order #${data.order_no}.`


            var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.user })
                .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

            if (storeAdmin) {
                var storeBoy = storeAdmin.user
            }
            else {
                storeBoy = data.user
            }


            notificationData = {
                source: data._id,
                body: bodyData,
                business: data.user,
                vendor: data.business,
                advisor: storeBoy,
                title: title,
                type: activity,
                created_at: new Date(),
                updated_at: new Date()

            }

            io.emit('Notify', { activity: "Order Shipped" });
        }

        else if (activity == 'Order Cancelled') {
            //console.log("data"+data.vendor);      
            var vendorDetail = await User.findOne({ _id: mongoose.Types.ObjectId(data.business) })
                .populate({ path: 'user', select: 'name contact_no address _id' })
                .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
                .exec()
            var title = 'Sales';
            var bodyData = `[Order Cancelled] ${vendorDetail.name} cancelled the order  #${data.order_no}.`


            var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.vendor })
                .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

            if (storeAdmin) {
                var storeBoy = storeAdmin.user
            }
            else {
                storeBoy = data.vendor
            }

            notificationData = {
                source: data._id,
                body: bodyData,
                business: data.vendor,
                vendor: data.business,
                advisor: storeBoy,
                title: title,
                type: activity,
                created_at: new Date(),
                updated_at: new Date()

            }

            io.emit('Notify', { activity: "Order Cancelled" });
        }

        else if (activity == 'Order Cancelled-Sale') {
            //console.log("data"+data.vendor);      
            var vendorDetail = await User.findOne({ _id: mongoose.Types.ObjectId(data.business) })
                .populate({ path: 'user', select: 'name contact_no address _id' })
                .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
                .exec()
            var title = 'Sales';
            var bodyData = `[Order Cancelled] ${vendorDetail.name} cancelled the order  #${data.order_no}.`


            var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.user })
                .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

            if (storeAdmin) {
                var storeBoy = storeAdmin.user
            }
            else {
                storeBoy = data.user
            }
            notificationData = {
                source: data._id,
                body: bodyData,
                business: data.user,
                vendor: data.business,
                advisor: storeBoy,
                title: title,
                type: activity,
                created_at: new Date(),
                updated_at: new Date()

            }

            io.emit('Notify', { activity: "Order Cancelled-Sale" });
        }

        else if (activity == 'Invoice Generate-Order') {
            //console.log("data"+data.vendor);      
            var vendorDetail = await User.findOne({ _id: mongoose.Types.ObjectId(data.business) })
                .populate({ path: 'user', select: 'name contact_no address _id' })
                .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
                .exec()
            var title = 'Sales';
            var bodyData = `[Invoice] Invoice amounting to ₹ ${data.due.due} generated by ${vendorDetail.name} .`

            // console.log('Sumit' + data);
            var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.user })
                .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

            if (storeAdmin) {
                var storeBoy = storeAdmin.user
            }
            else {
                storeBoy = data.user
            }
            notificationData = {
                source: data._id,
                body: bodyData,
                business: data.user,
                vendor: data.business,
                advisor: storeBoy,
                url: data.invoice_url,
                title: title,
                type: activity,
                created_at: new Date(),
                updated_at: new Date()

            }

            io.emit('Notify', { activity: "Invoice Generate-Order" });
        }

        else if (activity == 'Invoice Generate-Sale') {
            //console.log("data"+data.vendor);      
            var vendorDetail = await User.findOne({ _id: mongoose.Types.ObjectId(data.business) })
                .populate({ path: 'user', select: 'name contact_no address _id' })
                .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
                .exec()
            var title = 'Sales';
            var bodyData = `[Invoice] Invoice amounting to ₹ ${data.due.due} generated by ${vendorDetail.name} .`


            var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.user })
                .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

            if (storeAdmin) {
                var storeBoy = storeAdmin.user
            }
            else {
                storeBoy = data.user
            }
            notificationData = {
                source: data._id,
                body: bodyData,
                business: data.user,
                vendor: data.business,
                advisor: storeBoy,
                url: data.invoice_url,
                title: title,
                type: activity,
                created_at: new Date(),
                updated_at: new Date()

            }

            io.emit('Notify', { activity: "Invoice Generate-Sale" });
        }


        // else if (activity == 'eParchi') {
        //     //console.log("data"+data.vendor);      
        //     var parchi = await Parchi.findOne({ _id: mongoose.Types.ObjectId(data) })
        //         .populate({ path: 'user', select: 'name contact_no address _id' })
        //         .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
        //         .exec()
        //     var title = 'Sales';
        //     var due= parchi.payment.total.toLocaleString();
        //     var bodyData = `[eParchi] eParchi amounting to ₹${due} generated by ${parchi.business.name}.`

        //     var storeAdmin = await Management.findOne({ role: 'Store Manager', business: data.user })
        //         .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

        //     if (storeAdmin) {
        //         var storeBoy = storeAdmin.user
        //     }
        //     else {
        //         storeBoy = data.user
        //     }
        //     notificationData = {
        //         source: data._id,
        //         body: bodyData,
        //         business: data.user,
        //         vendor: data.business,
        //         advisor: storeBoy,

        //         title: title,
        //         type: activity,
        //         created_at: new Date(),
        //         updated_at: new Date()

        //     }

        //     io.emit('Notify', { activity: "eParchi" });
        // }

        await WebNotification.create(notificationData);
        //  console.log("completed");





    },
    getSalesTransaction: async function (sale, business) {
        var paid_total = 0;
        var returned_total = 0;
        var returned_total = 0;
        var transactions = await TransactionLog.find({ source: sale, business: business }).exec();
        var convenience_charges = 0;
        var sales = await Sales.findOne({ _id: sale, business: business }).exec();
        if (sales.payment.convenience_charges) {
            convenience_charges = Math.ceil(sales.payment.convenience_charges)
        }

        // var items = await OrderLine.find({ order: order, business: business, issued: true, status: { $nin: ['Cancelled'] } }).exec();
        var amount = _.sumBy(sales.parts, x => x.amount);

        if (transactions) {
            var received = _.filter(transactions, type => type.type == "recieved");
            received_total = parseFloat(_.sumBy(received, x => x.paid_total).toFixed(2));

            var returned = _.filter(transactions, type => type.type == "removed");
            returned_total = parseFloat(_.sumBy(returned, x => x.paid_total).toFixed(2));
        }
        var data = {
            transactions: transactions,
            paid_total: received_total,
            returned_total: returned_total,
        };

        return data;
    },



    //sumit... 
    partyStatement: async (user, period, data) => {
        var us = await User.findOne({ _id: mongoose.Types.ObjectId(user) }).exec();
        // console.log(us);
        // for (var i = 0; i < data.length; i++) {
        //     var dat = data[i].transaction_date.toString();
        //     var d = new Date(dat);
        //     const options = { year: 'numeric', month: 'short', day: 'numeric' };
        //     // console.log("logggggg"+ moment(dat).format('MMMM DD, YYYY, h:mm:ss A'));
        //     console.log("sssssss" + d.toLocaleDateString('en-US', options));

        // }
        var p = period.from;
        // console.log("ff" + moment(period.from).format('MMMM DD, YYYY'));

        var statements = await Statements.findOne({ user: mongoose.Types.ObjectId(user) })
            .populate({ path: 'user', select: 'name contact_no' })
            .populate({ path: 'business', select: 'name contact_no' }).exec();

        if (statements) {
            // console.log(statements);
            // var totalResult = await Statements.find({user: mongoose.Types.ObjectId(user) }).count();
            // console.log("total" + totalResult);
            var file = statements.user.name;
            // console.log("sffdgfd" + statements.business.name);

            // console.log("sssssss" + statements.transaction_date);
            // console.log("seudfsdf" + statements.transaction_date.toLocaleTimeString('en-US'));
            var info = `${statements.transaction_date.toString().slice(4, 15)}, ${statements.transaction_date.toLocaleTimeString('en-US')}`
            // console.log("Infoooo" + info);

            var statements = {
                user: statements.user,
                business: statements.business,
                status: statements.status,
                type: statements.type,
                paid_by: statements.paid_by,
                activity: statements.activity,
                source: statements.source,
                bill_id: statements.bill_id,
                bill_amount: statements.bill_amount,
                transaction_amount: statements.transaction_amount,
                balance: statements.balance,
                total: statements.total,
                paid_total: statements.paid_total,
                // due: parseFloat(statements.bill_amount) - parseFloat(statements.paid_total),
                payment_status: statements.payment_status,
                payment_mode: statements.payment_mode,
                received_by: statements.received_by,
                transaction_id: statements.transaction_id,
                transaction_date: statements.transaction_date,
                transaction_status: statements.transaction_status,
                transaction_response: statements.transaction_response,

            }

            var party = await User.findById(statements.user).exec();
            // console.log("party " + party);
            if (party) {
                var query = {
                    user: party._id,
                    business: statements.business
                }
                var businessDetails = await User.findById(statements.business).exec();

                var details = await q.all(businessFunctions.getStatementDetails(query));
                var partDetails = {}
                if (details) {
                    partDetails = {
                        party: party,
                        totalSale: details.totalSale - details.totalSaleCancelled,
                        totalPurchase: details.totalPurchase - details.totalPurchaseCancelled,
                        totalPaymentIn: details.totalPaymentIn,
                        totalPaymentOut: details.totalPaymentOut,
                        totalPurchaseCancelled: details.totalPurchaseCancelled,
                        totalSaleCancelled: details.totalPurchaseCancelled,
                        balance: details.balance,
                        business: businessDetails,
                    }

                }
            }
            // console.log("details----" + data);

            ejs.renderFile(path.join(__dirname, "../views", "/partyStatement.ejs"), {
                statements: data,
                details: partDetails, period: period
            }, (err, data) => {
                if (err) {
                    return console.log(err);
                } else {
                    //              let options = {

                    //                  border: {
                    //   "top": "0.3in",
                    //   "right": "0.2in",
                    //   "left": "0.2in",
                    //   "bottom":"0in"
                    // },
                    // footer: {
                    //   height:"15mm",
                    //   "contents": "<div style='color: gray;border-top: 1px lightgray solid;font-size: 13px;padding-top: 10px'>本pdf由<a href='http://doclever.cn'>DOClever</a>生成</div>"
                    // },

                    //              };

                    let options = { format: 'A3', header: { "height": "5mm" }, footer: { "height": "5mm" }, border: { top: '10px', bottom: '10px', left: '33px', right: '33px' } }


                    pdf.create(data, options).toStream(async function (err, stream) {
                        if (err) {
                            return console.log(err)
                        }

                        else {
                            var s3URL = await event.uploadToS3(stream, file, user)
                            // if (s3URL.url) {
                            //     console.log("Data URL " + s3URL.url)

                            // }
                            //sendStatement(file, party)  

                        }



                    });



                    // .toFile( `./Pdfs/${file}.pdf`, function (err, data) {
                    //     if (err) {

                    //         return console.log(err);
                    //     } else {
                    //         // ss(statements);

                    //          return console.log("File created successfully");

                    //     }
                    // });


                }

            });

        }
        else return console.log('statements missing');
    },



    invoicePdf: async (b, invoice, business) => {
        // console.log("bb " + invoice._id);

        var business = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();

        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email address" } })
            // .populate({ path: 'admin', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type vin engine_no' })
            .exec();
        var address = await Address.findOne({ _id: mongoose.Types.ObjectId(invoice.address) }).exec();

        var file = booking.car.registration_no;


        var ser = invoice.services;


        var serial = [];
        for (var i = 0; i < ser.length; i++) {
            for (var j = 0; j < ser[i].parts.length; j++) {
                serial.push(ser[i].parts[j].item)
                // console.log(ser[i].parts[j].item)

            }
        }
        //const result = serial.filter(serial => serial.length );
        for (var i = 0; i < serial.length; i++) {
            // console.log(i + 1);
        }


        //           // console.log("filter"+result);
        //             //file name..
        //             var sum= 0
        //             var summ=0;
        //             var labsum=0
        //             var lav=0;
        //             var fit= 0;
        //             var fitsum=0;
        //             var  taxArr= [];

        //             for(var i= 0; i < ser.length; i++){
        //                 for(var j=0; j<ser[i].parts.length;j++){
        //                    // console.log(ser[i].parts[j].tax_info.amount);
        //               taxArr.push(ser[i].parts[j]);

        // //for(var s= 0; s= ser[i].parts[j].tax_info.detail.length;s++){
        //                     if(ser[i].parts[j].tax== '18.0% GST'){

        //                     // console.log("Sumit"+ser[i].parts[j].tax_amount)

        //                      sum +=  ser[i].parts[j].tax_amount/2;

        //                     }
        //                     if(ser[i].parts[j].tax=='28.0% GST'){

        //                         summ +=  ser[i].parts[j].tax_amount/2;


        //                     }
        // //}
        //                 }

        //                 for(var k= 0;k<ser[i].labour.length;k++){

        //                     if(ser[i].labour[k].tax== '18.0% GST'){

        //                         // console.log("Sumit"+ser[i].labour[k].tax_amount)

        //                          lav +=  ser[i].labour[k].tax_amount/2;

        //                         }

        //                         if(ser[i].labour[k].tax=='28.0% GST'){

        //                             labsum +=  ser[k].labour[j].tax_amount/2;
        //                         }

        //                 }

        //                 for(var t=0; t<ser[i].opening_fitting.length; t++){
        //                     if(ser[i].opening_fitting[t].tax== '18.0% GST'){

        //                         // console.log("Sumit"+ser[i].opening_fitting[t].tax_amount)

        //                          fit +=  ser[i].opening_fitting[t].tax_amount/2;

        //                         }
        //                         if(ser[i].opening_fitting[t].tax=='28.0% GST'){

        //                             fitsum += ser[i].opening_fitting[t].tax/2;
        //                         }


        //                 }




        //             }

        //            //const answer = taxArr.tax.filter(taxArr => taxArr == '28.0% GST');



        // console.log("d" + sum + ' ' + lav + ' ' + fit);

        // console.log("28d" + rr.toFixed(2));

        // console.log("18% " + tt.toFixed(2));

        var bill = {}

        ejs.renderFile(path.join(__dirname, "../views", "/invoice.ejs"), {
            bill: invoice,
            business: business, booking: booking, address: address
        }, (err, data) => {
            if (err) {
                return console.log(err);
            } else {

                let options = { format: 'A3', header: { "height": "5mm" }, footer: { "height": "5mm" }, border: { top: '0px', bottom: '0px', left: '0px' } }


                pdf.create(data, options).toStream(function (err, stream) {
                    if (err) {
                        return console.log(err)
                    }

                    else {
                        // console.log("Sumit" + invoice.user);
                        event.uploadToS3Invoice(stream, file, invoice)

                        // sendStatementInvoice(file)  

                    }



                });






            }

        });


    },


    performaPdf: async (b, address, business) => {

        var business = await User.findOne({ _id: mongoose.Types.ObjectId(business) })
            .exec();

        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email address" } })
            // .populate({ path: 'admin', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type vin engine_no' })
            .exec();


        var file = booking.car.registration_no;




        // console.log();



        var bill = {}

        ejs.renderFile(path.join(__dirname, "../views", "/performa.ejs"), {
            booking: booking,
            business: business, address: address
        }, (err, data) => {
            if (err) {
                return console.log(err);
            } else {

                let options = { format: 'A3', header: { "height": "5mm" }, footer: { "height": "5mm" }, border: { top: '0px', bottom: '25px', left: '40px', right: '40px' } }


                pdf.create(data, options).toStream(function (err, stream) {
                    if (err) {
                        return console.log(err)
                    }

                    else {

                        event.uploadToS3Performa(stream, file, b)

                        // sendStatementInvoice(file)  

                    }



                });






            }

        });


    },


    //OrderInvoice..
    orderInvoice: async (productDetails, p, address) => {
        var businessInfo = await User.findOne({ _id: mongoose.Types.ObjectId(p.business) }).exec();
        var userInfo = await User.findOne({ _id: mongoose.Types.ObjectId(p.user) }).exec();

        var file = userInfo.name;

        ejs.renderFile(path.join(__dirname, "../views", "/orderInvoice.ejs"), {
            product: productDetails,
            business: businessInfo, user: userInfo, address: address, p: p
        }, (err, data) => {
            if (err) {
                return console.log(err);
            } else {
                let options = { format: 'A3', header: { "height": "5mm" }, footer: { "height": "5mm" }, border: { top: '0px', bottom: '0px', left: '0px' } }

                pdf.create(data, options).toStream(function (err, stream) {
                    if (err) {
                        return console.log(err)
                    }
                    else {
                        event.uploadToS3InvoiceOrder(stream, file, p._id)

                    }

                });
            }
        });
    },

    estimatePdf: async (b, address, business, activity) => {
        var business = await User.findOne({ _id: mongoose.Types.ObjectId(business) })
            .exec();
        var booking = await Booking.findOne({ _id: b })
            .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email address" } })
            // .populate({ path: 'admin', populate: { path: 'user', select: "_id id name contact_no email" } })
            .populate({ path: 'car', select: '_id id title registration_no fuel_type vin engine_no' })
            .exec();

        // var file = booking.car.registration_no;
        //console.log("entered Sumit...");
        let preEstimatepdf = ''
        if (booking.estimate_pdf) {
            if (booking.estimate_pdf.filename != '') {
                preEstimatepdf = booking.estimate_pdf.filename
            }
        }

        var bill = {}
        ejs.renderFile(path.join(__dirname, "../views", "/estimate.ejs"), {
            booking: booking,
            business: business, address: address
        }, (err, data) => {
            if (err) {
                return console.log(err);
            } else {
                let options = { format: 'A3', header: { "height": "5mm" }, footer: { "height": "5mm" }, border: { top: '0px', bottom: '0px', left: '0px' } }

                pdf.create(data, options).toStream(function (err, stream) {
                    if (err) {
                        return console.log(err)
                    }
                    else {
                        event.uploadToS3Estimate(stream, booking, activity, preEstimatepdf)
                    }
                });
            }
        });
    },

    eParchiPdf: async (parchiId, statement) => {
        //console.log("ssss"+ JSON.stringify(statement));
        var parchi = await Parchi.findOne({ _id: mongoose.Types.ObjectId(parchiId) })
            .populate({ path: 'user', select: 'name contact_no username email account_info business_info' })
            .populate({ path: "business", select: "name address business_info contact_no email account_info bank_details" })
            .populate('address')
            .exec();

        var file = parchi.user.name;
        //console.log("entered Sumit...");


        ejs.renderFile(path.join(__dirname, "../views", "/parchi.ejs"), {
            parchi: parchi, statement: statement
        }, (err, data) => {
            if (err) {
                return console.log(err);
            } else {
                let options = { format: 'A3', header: { "height": "5mm" }, footer: { "height": "5mm" }, border: { top: '0px', bottom: '0px', left: '0px' } }

                pdf.create(data, options).toStream(function (err, stream) {
                    if (err) {
                        return console.log(err)
                    }
                    else {
                        event.uploadToS3Parchi(stream, file, parchiId)
                    }
                });
            }
        });
    },


    paymentPdf: async (user, payment, businessId) => {
        const toWords = new ToWords();
        var businessDetails = await User.findOne({ _id: mongoose.Types.ObjectId(businessId) }).exec();
        var file = user.name
        //console.log("entered Sumit...");
        // var totalAmount = toWords.convert(payment.total)
        var totalAmount = numtoWords(parseInt(payment.total))


        // console.log("sss"+am);
        ejs.renderFile(path.join(__dirname, "../views", "/paymentRec.ejs"), {
            user: user, payment: payment, business: businessDetails, total: totalAmount
        }, (err, data) => {
            if (err) {
                return console.log(err);
            } else {
                let options = { format: 'A3', header: { "height": "10mm" }, footer: { "height": "10mm", }, border: { top: '5px', bottom: '0px', left: '5px', right: '5px' } }

                pdf.create(data, options).toStream(function (err, stream) {
                    if (err) {
                        return console.log(err)
                    }
                    else {
                        console.log('ss');
                        event.uploadToS3Payment(stream, file, payment._id)
                    }
                });
            }
        });
    },
    purchaseBill: async (p) => {
        var purchase = await Purchase.findOne({ _id: mongoose.Types.ObjectId(p), status: 'Completed' })
            .populate({ path: 'vendor_address' })
            .populate({ path: 'vendor', select: 'name username avatar avatar_address address contact_no business_info' })
            .populate({ path: 'business', select: 'name username avatar avatar_address address contact_no business_info' })
            .exec();
        if (purchase) {

            var itemsArray = [];
            var file = purchase.vendor.name
            var product = purchase.items;
            //console.log(purchase.length);

            if (product.length !== 0) {
                for (var i = 0; i < product.length; i++) {
                    itemsArray.push({
                        part_no: product[i].part_no,
                        hsn_sac: product[i].hsn_sac,
                        unit: product[i].unit,
                        title: product[i].title,
                        sku: product[i].sku,
                        mrp: product[i].mrp,
                        selling_price: product[i].selling_price,
                        rate: product[i].rate,
                        quantity: product[i].quantity,
                        base: product[i].base,
                        amount: product[i].amount,
                        discount: product[i].discount,
                        discount_total: product[i].discount_total,
                        amount_is_tax: product[i].amount_is_tax,
                        tax_amount: product[i].tax_amount,
                        tax: product[i].tax,
                        tax_rate: product[i].tax_rate,
                        tax_info: product[i].tax_info,

                    })

                }

                ejs.renderFile(path.join(__dirname, "../views", "/purchaseBill.ejs"), {
                    partsArray: itemsArray, address: purchase.vendor_address, business: purchase.business, user: purchase.vendor, p: purchase
                }, (err, data) => {
                    if (err) {
                        return console.log(err);
                    } else {
                        let options = { format: 'A3', header: { "height": "10mm" }, footer: { "height": "10mm", }, border: { top: '5px', bottom: '0px', left: '5px', right: '5px' } }

                        pdf.create(data, options).toStream(function (err, stream) {
                            if (err) {
                                return console.log(err)
                            }
                            else {
                                console.log('ss');
                                event.uploadToS3PurchaseBill(stream, file, purchase._id)
                            }
                        });
                    }
                });
            }
            else {
                return console.log('items not found')
            }

        }
        else {
            return console.log('query is not matched')
        }
    }

};

