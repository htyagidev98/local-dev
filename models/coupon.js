const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
    package Structer
*/

const PackageSchema = new Schema({
    type: {
        type: String
    },
    source: {
        type: Schema.ObjectId,
        default: null
    },
    package: {
        type: String,
        default: ""
    }
});


const CouponSchema = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },

    code: {
        type: String
    },
    limit: {
        type: Number
    },
    price_limit: {
        type: Number
    },
    type: {
        type: String
    },
    coupon_on: {
        type: String
    },
    discount: {
        type: Number
    },
    for: {
        type: String
    },
    label: {
        type: String
    },
    discount_on: {
        type: String
    },
    package: PackageSchema,
    description: {
        type: String
    },
    terms: {
        type: String
    },
    usage_limit: {
        type: Number
    },
    campaign: {
        type: String
    },
    is_product: {
        type: Boolean,
        default: false
    },
    physical: {
        type: Boolean,
        default: false
    },
    publish: {
        type: Boolean,
        default: false
    },
    offer: {
        type: Schema.ObjectId,
        ref: 'businessOffer',
        default: null
    },
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date,
    },
    created_at: {
        type: Date,
    },
    expired_at: {
        type: Date,
    }
});

CouponSchema.set('toObject', { virtuals: true });
CouponSchema.set('toJSON', { virtuals: true });

const Coupon = mongoose.model('Coupon', CouponSchema, 'Coupon');

module.exports = Coupon;