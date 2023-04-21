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
const OrderLine = require('../models/orderLine');
const Booking = require('../models/booking');
const ActivityLog = require('../models/activityLog');
const TransactionLog = require('../models/transactionLog');

var moment = require('moment-timezone');
var FCM = require('fcm-node');

module.exports = {
    activityLog: async function(activity) {
        ActivityLog.create(activity).then(async function (log) {
            console.log(log)
        });
    },
    
    bookingLog: async function(b,activity) {
        var booking = await Booking.findOne({_id: b}).exec();
        var logs = await Booking.findOne({
                    _id: b,
                    logs: {
                        $elemMatch: { activity: activity.activity  }
                    }
                }).count().exec();
        
        if(booking){
            if(logs==0){
                var log = {
                    user: activity.user,
                    name: activity.name,
                    stage: activity.stage,
                    activity: activity.activity,
                    created_at: booking.created_at,
                    updated_at: booking.updated_at,
                }
                Booking.findOneAndUpdate({_id: b},{$push:{logs:log}},{new: true}, async function(err, doc){})
            }
        }
    },

    transactionLog: async function(booking,transaction) {
        var booking = await Booking.findById(booking).exec();
        if(!transaction){
            transaction = 0;
        }

        TransactionLog.create({
            user: booking.user,
            activity: "Booking",
            source: booking._id,
            paid_total:transaction, 
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

    orderTransactionLog: async function(order,transaction) {
        var order = await Order.findById(order).exec();
        if(!transaction){
            transaction = 0;
        }

        TransactionLog.create({
            user: order.user,
            activity: "Order",
            source: order._id,
            paid_total:transaction, 
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
    
    orderLog: async function(o,status) {
        var order = await Order.findById(o).exec();
        await OrderLine.find({order: order._id})
        .cursor()
        .eachAsync(async function(p){
            OrderLine.findOneAndUpdate({_id: p._id}, {$set: {status: status} }, {new: false}, async function(err, doc){
                OrderLine.findOneAndUpdate({_id: p._id}, {$push: {log: {status: status,created_at:order.updated_at,updated_at:order.updated_at}} }, {new: false}, async function(err, doc){
                    //console.log("push")
                })
            })
        })

        await BusinessOrder.find({order: order._id})
        .cursor()
        .eachAsync(async function(p){
            BusinessOrder.findOneAndUpdate({_id: p._id}, {$set: {status: status} }, {new: false}, async function(err, doc){
                BusinessOrder.findOneAndUpdate({_id: p._id}, {$push: {log: {status: status,created_at:order.updated_at,updated_at:order.updated_at}} }, {new: false}, async function(err, doc){
                })
            })
        })
    },

    postView: async function(post, user, timezone) {
         var data = {
            post: post, 
            user: user,
            timezone: timezone,
            created_at: new Date(),
            updated_at: new Date(),
        }
        var lastView = await PostView.findOne({post: post, user: user, timezone: timezone}).sort({created_at: -1}).exec();
        if(lastView){
            var a = moment(new Date());//now
            var b = moment(lastView.created_at);
            var diff = a.diff(b, 'hours');
            //console.log(diff)
            if(diff >= 8)
            {
                PostView.create(data).then(async function (pv) {});
            }
        }else{
            PostView.create(data).then(async function (pv) {});
        }
    },
    
    profileView: async function(profile, user, timezone) {
        var data = {
            profile: profile, 
            user: user,
            timezone: timezone,
            created_at: new Date(),
            updated_at: new Date(),
        }
        if(profile!=user){
            var lastView = await ProfileView.findOne({profile: profile, user: user, timezone: timezone}).sort({created_at: -1}).exec();
            if(lastView){
                var a = moment(new Date());//now
                var b = moment(lastView.created_at);
                var diff = a.diff(b, 'hours');
                //console.log(diff)
                if(diff >= 8)
                {
                    ProfileView.create(data).then(async function (pv) {});
                }
            }else{
                ProfileView.create(data).then(async function (pv) {});
            }
        }
    },
    addMember: async function(user, model) {
        var club = await Club.findOne({model: model}).exec();
        //console.log(club)
        var member = await ClubMember.findOne({club: club._id, model: model, user: user}).count().exec();
        if(member==0)
        {
            var data = {
                club: club._id, 
                model: model,
                user: user,
                created_at: new Date(),
                updated_at: new Date()
            }
            await ClubMember.create(data).then(async function (member) { console.log("new member added")})
        }           
    },
    addPoints: async function(data) {
        data.created_at=new Date();
        data.updated_at= new Date();
        data.type= "credit";
        var user = await User.findOne({_id:data.user}).exec();
        var carEagerCoins = user.careager_cash;
        carEagerCoins = Math.ceil(carEagerCoins)+Math.ceil(data.points);
        return new Promise((resolve, reject) => {
            if(data.points>0){
                Point.create(data).then(async function (point) {
                    User.findOneAndUpdate({_id: data.user}, {$set:{careager_cash:carEagerCoins}}, {new: false}, async function(err, doc){});
                })

                var notify= {
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
    deductPoints: async function(data) {
        data.created_at=new Date();
        data.updated_at= new Date();
        data.type= "debit";
        var user = await User.findOne({_id:data.user}).exec();
        var carEagerCoins = user.careager_cash;
        carEagerCoins = carEagerCoins-data.points;
        return new Promise((resolve, reject) => {
            if(data.points>0){
                Point.create(data).then(async function (point) {
                	User.findOneAndUpdate({_id: data.user}, {$set:{careager_cash:carEagerCoins}}, {new: false}, async function(err, doc){});
                })

                var notify= {
                    sender: data.sender,
                    receiver: [data.user],
                    points: data.points,
                    activity: data.activity,
                    tag: data.tag,
                    source: data.source
                };
                resolve(module.exports.newNotification(notify));
            }
        })       
    },

    newNotification: async function(data) {
        data.body ="";
        var sender = null;
        if(data.sender){
            sender = await User.findOne({_id:data.sender}).exec();
        }
        return new Promise((resolve, reject) => {
            data.receiver.forEach(async function(receiver){
                var user = await User.findOne({_id:receiver}).exec(); 
                if(receiver != data.sender)
                {
                    if(data.tag=="welcome"){
                        data.title = data.points+" CarEager cash added to your account";
                    }
                    else if(data.tag=="referNEarn"){
                        data.title = data.points+" CarEager cash added to your account";
                    }
                    else if(data.tag=="commission"){
                        data.title = data.points+" CarEager cash added to your account";
                    }
                    else if(data.tag=="addLocalBusiness"){
                        data.title = data.points+" CarEager cash added to your account";
                    }
                    else if(data.tag=="post"){
                        data.title = data.points+" CarEager cash added to your account";
                    }
                    else if(data.tag=="mention"){
                        data.title = "You are mentioned in a post by "+sender.name;
                    } 
                    else if(data.tag=="like"){
                        data.title = sender.name+" liked your post";
                    }
                    else if(data.tag=="comment"){
                        data.title = sender.name+" commented on your post";
                    }
                    else if(data.tag=="mentionInComment"){
                        data.title = "You are mentioned in a comment by "+sender.name
                    }
                    else if(data.tag=="follow"){
                        data.title = sender.name+" followed you";
                    }
                    else if(data.tag=="businessReview"){
                        data.title = data.points+" CarEager cash added to your account";
                    }
                    else if(data.tag=="review"){
                        data.title = sender.name+" rated you "+data.points+" star";
                    }
                    else if(data.tag=="modelReview"){
                        data.title = data.points+" CarEager cash added to your account";
                    }
                    else if(data.tag=="assignedBooking"){
                        var booking =  await Booking.findOne({'_id':data.source})
                                        .populate({path: 'advisor',populate:{ path: 'user',select: "_id id name contact_no"}})
                                        .populate({path: 'user',populate:{ path: 'user',select: "_id id name contact_no"}})
                                        .populate({path: 'car',select:'_id id title registration_no'})
                                        .exec();

                        var services=[];
                        booking.services.forEach(function(service){
                            services.push(service.service)
                        });

                        data.title = "Booking Assigned";
                        data.body = "A New Booking has been Assigned to you";
                    }

                    else if(data.tag=="rework"){
                        var booking =  await Booking.findOne({'_id':data.source})
                                        .populate({path: 'user',populate:{ path: 'user',select: "_id id name contact_no"}})
                                        .populate({path: 'car',select:'_id id title registration_no'})
                                        .exec();


                        data.title =  "Booking Re-assigned ID #-"+booking.booking_no;
                    }
                    else if(data.tag=="newBooking"){
                        var booking =  await Booking.findOne({'_id':data.source})
                                        .populate({path: 'user',populate:{ path: 'user',select: "_id id name contact_no"}})
                                        .populate({path: 'car',select:'_id id title registration_no'})
                                        .exec();

                        var services=[];
                        booking.services.forEach(function(service){
                            services.push(service.service)
                        });

                        data.title =  "New Service - "+sender.name;
                        data.body = booking.car.title+" - "+services.toString();
                    }
                    else if(data.tag=="newPackage"){
                        var booking =  await Booking.findOne({'_id':data.source})
                                        .populate({path: 'user',populate:{ path: 'user',select: "_id id name contact_no"}})
                                        .populate({path: 'car',select:'_id id title registration_no'})
                                        .exec();

                        var services=[];

                        booking.services.forEach(function(service){
                            services.push(service.service)
                        });

                        data.title =  "New Package - "+sender.name;
                        data.body = booking.car.title+" - "+services.toString();
                    }
                    else if(data.tag=="bookingReschedule"){
                        var booking =  await Booking.findOne({'_id':data.source})
                                        .populate({path: 'user',populate:{ path: 'user',select: "_id id name contact_no"}})
                                        .populate({path: 'car',select:'_id id title registration_no'})
                                        .exec();

                        data.title =  "#"+booking.booking_no+" Service Reschedule - "+sender.name;
                        data.body =    moment(booking.date).tz(data.tz).format('ll')+" - "+booking.time_slot;
                    }

                    else if(data.tag=="bookingRejected"){
                        var booking =  await Booking.findOne({'_id':data.source})
                                        .populate({path: 'user',populate:{ path: 'user',select: "_id id name contact_no"}})
                                        .populate({path: 'car',select:'_id id title registration_no'})
                                        .exec();

                        data.title =  "#"+booking.booking_no+" has been rejected.";
                    }
                    else if(data.tag=="bookingConfirmation"){
                        data.title = sender.name+" confirmed your service appointment";
                    }
                    else if(data.tag=="bookingApproved"){
                        data.title = sender.name+" confirmed your service estimation";
                    }
                    else if(data.tag=="userCancelledBooking"){
                        data.title = sender.name+" cancelled the service appointment";
                    }
                    else if(data.tag=="BookingCancelled"){
                        data.title = "Your booking has been cancelled";
                    }
                    else if(data.tag=="OrderCancelled"){
                        data.title = "Your order has been cancelled";
                    }
                    else if(data.tag=="postDelete"){
                        data.title = data.points+" CarEager cash deducted from your account";
                    }
                    else if(data.tag=="estimation"){
                        var booking =  await Booking.findOne({'_id':data.source})
                                        .populate({path: 'user',populate:{ path: 'user',select: "_id id name contact_no"}})
                                        .populate({path: 'car',select:'_id id title registration_no'})
                                        .exec();

                        data.title = "New Service Estimation is waiting for your approval";
                    }
                    else if(data.tag=="bookingCompleted"){
                        var booking =  await Booking.findOne({'_id':data.source})
                                        .populate({path: 'user',populate:{ path: 'user',select: "_id id name contact_no"}})
                                        .populate({path: 'car',select:'_id id title registration_no'})
                                        .exec();

                        data.title = "Booking #"+booking.booking_no+" has been completed";
                        data.body = data.points+" CarEager cash added to your account";
                    }
                    else if(data.tag=="newOrder"){
                        data.title = sender.name+" New Order has been placed";
                    }
                    data.created_at =new Date();
                    data.updated_at = new Date();
                    data.user = user._id;

                    Notification.create(data).then(async function (notification) {
                        var fcmCli = new FCM(config.server_key);
                        if(user){
                            if(user.device){
                                user.device.forEach(function(device){
                                    var fcmId = device.fcmId;
                                    
                                    var payloadOK = {
                                        to: fcmId,
                                        data: { //some data object (optional)
                                            title: notification.title, 
                                            body: notification.body, 
                                            sound : "default", 
                                            badge: "1", 
                                            source: notification.source, 
                                            tag: notification.tag,
                                            activity: notification.activity
                                        },
                                        notification: { 
                                            title: notification.title, 
                                            body: notification.body, 
                                            sound : "default", 
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
                                            sound : "default", 
                                            badge: "1", 
                                            source: notification.source, 
                                            tag: notification.tag,
                                            activity: notification.activity
                                        },
                                        notification: { 
                                            title: notification.title, 
                                            body: notification.body, 
                                            sound : "default", 
                                            badge: "1", 
                                            source: notification.source, 
                                            tag: notification.tag,
                                            activity: notification.activity
                                        },
                                        priority: 'high',
                                        content_available: true,
                                    };


                                    var callbackLog = function (sender, err, res) {
                                        console.log("\n__________________________________")
                                        console.log("\t"+sender);
                                        console.log("----------------------------------")
                                        console.log("err="+err);
                                        console.log("res="+res);
                                        console.log("----------------------------------\n>>>");
                                    };

                                    function sendOK()
                                    {
                                        fcmCli.send(payloadOK,function(err,res){
                                            callbackLog('sendOK',err,res);
                                        });
                                    };

                                    function sendError() {
                                        fcmCli.send(payloadError,function(err,res){
                                            callbackLog('sendError',err,res);
                                        });
                                    };

                                    sendOK();
                                });
                            }
                        }
                    });
                }   
            });
        });
    },
};

