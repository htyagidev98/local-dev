const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const CarSellLeadSchema = new Schema({
    user: {
        type:Schema.ObjectId,
        ref:'User',
    }, 
    
    car: {
        type:Schema.ObjectId,
        ref:'Car',
    }, 

    otp: {
        type: Number,
    }, 

    verified: {
        type: Boolean,
        default: true
    },

    expired_at:{
        type:Date,
    },

    created_at:{
        type:Date,
    },

    updated_at:{
        type:Date,
    }
});

CarSellLeadSchema.set('toObject', { virtuals: true });
CarSellLeadSchema.set('toJSON', { virtuals: true });

const CarSellLead = mongoose.model('CarSellLead',CarSellLeadSchema,'CarSellLead');

module.exports = CarSellLead;