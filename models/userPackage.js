const mongoose = require('mongoose');
const Schema = mongoose.Schema;

config = require('./../config')

const DiscountSchema = new Schema({
    title: {
        type: String
    },
    for: {
        type: String
    },
    label: {
        type: String
    },
    limit: {
        type: Number
    },
    discount: {
        type: Number
    },
    type: {
        type: String
    },
    discount_type: {
        type: String
    }
});


const PaymentSchema = new Schema({
    payment_status: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    total: {
        type: Number,
    },
    discount_type: {
        type: String,
        default: ""
    },

    coupon_type: {
        type: String,
        default: ""
    },
    coupon: {
        type: String,
        default: ""
    },
    discount: {
        type: Number,
        default: 0
    },
    discount_total: {
        type: Number,
        default: 0
    },
    paid_total: {
        type: Number,
        default: 0
    },
    discount_applied: {
        type: Boolean,
        default: false
    },
    transaction_id: {
        type: String,
        default: ""
    },
    transaction_date: {
        type: String,
        default: ""
    },
    transaction_status: {
        type: String,
        default: ""
    },
    transaction_response: {
        type: String,
        default: ""
    },

});

const UserPackageSchema = new Schema({
    name: {
        type: String
    },

    user: {
        type: Schema.ObjectId,
        ref: 'User',
    },

    business: {
        type: Schema.ObjectId,
        ref: 'User',
    },

    car: {
        type: Schema.ObjectId,
        ref: 'Car',
    },

    booking: {
        type: Schema.ObjectId,
        ref: 'Booking',
    },

    package: {
        type: Schema.ObjectId,
        ref: 'Package',
    },

    category: {
        type: String
    },

    discount: [DiscountSchema],

    payment: PaymentSchema,

    description: {
        type: String
    },

    mrp: {
        type: Number
    },

    cost: {
        type: Number
    },

    cashback: {
        type: Number,
        default: 0
    },

    //abhinav
    service_cashback: {
        type: Number,
        default: 0
    },

    validity: {
        type: Number
    },

    status: {
        type: Boolean,
        default: true
    },

    created_at: {
        type: Date
    },

    expired_at: {
        type: Date
    },

    updated_at: {
        type: Date
    }
});


UserPackageSchema.set('toObject', { virtuals: true });
UserPackageSchema.set('toJSON', { virtuals: true });

const UserPackage = mongoose.model('UserPackage', UserPackageSchema, 'UserPackage');

module.exports = UserPackage;
