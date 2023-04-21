const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const CarSellSchema = new Schema({
    car: {
        type:Schema.ObjectId,
        ref:'Car',
        required:[true,'Car ObjectId field is required'],
    },

    owner: {
        type:Schema.ObjectId,
        ref:'User',
    }, 

    seller: {
        type:Schema.ObjectId,
        ref:'User',
    },

    buyer: {
        type:Schema.ObjectId,
        ref:'User',
        default: null
    },  
    
    package: {
        type:Schema.ObjectId,
        ref: 'Package',
        default: null
    },

    logs:[],

    otp: {
        type: Number,
    }, 

    buyer_otp: {
        type: Number,
    }, 

    price: {
        type: Number,
    }, 

    purchase_price: {
        type:Number,
        default:0
    },
    refurbishment_cost: {
        type:Number,
        default:0
    },
    
    package_cost: {
        type:Number,
        default:0
    },

    user_verified: {
        type: Boolean,
        default: false
    },

    buyer_verified: {
        type: Boolean,
        default: false
    },
   
    admin_verified: {
        type: Boolean,
        default: false
    },

    sold: {
        type: Boolean,
        default: false
    },

    package_sold: {
        type: Boolean,
        default: false
    },

    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

CarSellSchema.set('toObject', { virtuals: true });
CarSellSchema.set('toJSON', { virtuals: true });

const CarSell = mongoose.model('CarSell',CarSellSchema,'CarSell');

module.exports = CarSell;