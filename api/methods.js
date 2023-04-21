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
const Lead = require('../models/lead');
const ActivityLog = require('../models/activityLog');
const TransactionLog = require('../models/transactionLog');
const CarSellLead = require('../models/carSellLead');

var moment = require('moment-timezone');
var FCM = require('fcm-node');

function getCarEagerCashDiscount(booking) {

    var approved = _.filter(booking.services, customer_approval => customer_approval.customer_approval == true);
    var discount = 0;
    var labour_cost = _.sumBy(approved, x => x.labour_cost);

    var careager_cash = booking.user.careager_cash;

    if (booking.business.isCarEager == true) {
        if (booking.user.partner) {
            if (booking.user.partner.partner == true) {
                if (careager_cash < labour_cost) {
                    discount = careager_cash;
                }
                else {
                    discount = labour_cost;
                }
            }
        }
        else {
            var coinsCalc = careager_cash * 70;
            if (coinsCalc < labour_cost) {
                discount = careager_cash;
            }
            else {
                discount = Math.ceil(careager_cash * (20 / 100));
            }
        }
    }

    return discount
}

module.exports.getCarEagerCashDiscount = getCarEagerCashDiscount;