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
    category: {
        type: String
    },
    limit: {
        type: Number
    },
    discount_type: {
        type: String
    },
    discount: {
        type: Number
    },
    type: {
        type: String
    }
});

const PackageSchema = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
    },

    offer: {
        type: Schema.ObjectId,
        ref: 'Offer',
    },

    name: {
        type: String
    },

    category: {
        type: String
    },

    discount: [DiscountSchema],

    description: {
        type: String
    },

    automakers: [],

    mrp: {
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

    cost: {
        type: Number
    },

    label: {
        type: String
    },

    validity: {
        type: Number
    },

    doorstep: {
        type: Boolean,
        default: false
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


PackageSchema.set('toObject', { virtuals: true });
PackageSchema.set('toJSON', { virtuals: true });

/*PackageSchema.pre('save',function (next) {
  var Package = this;
  var currentDate = new Date();
  Package.created_at = currentDate;
  Package.updated_at = currentDate;
});*/

const Package = mongoose.model('Package', PackageSchema, 'Package');

module.exports = Package;
