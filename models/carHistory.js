const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const CarHistorychema = new Schema({
    car: {
        type:Schema.ObjectId,
        ref:'Car',
        required:[true,'Car ObjectId field is required'],
    },

    owner: {
        type:Schema.ObjectId,
        ref:'user',
    }, 

    seller: {
        type:Schema.ObjectId,
        ref:'user',
    },

    buyer: {
        type:Schema.ObjectId,
        ref:'user',
        default: null
    },

    updated_by: {
        type:Schema.ObjectId,
        ref:'user',
    },

    otp: {
        type: String,
    }, 

    verified: {
        type: Boolean,
        default: true
    },

    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

CarHistorychema.set('toObject', { virtuals: true });
CarHistorychema.set('toJSON', { virtuals: true });

const CarHistory = mongoose.model('CarHistory',CarHistorychema,'CarHistory');

module.exports = CarHistory;