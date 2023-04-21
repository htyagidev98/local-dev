const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var config = require('./../config');

const BusinessConvenienceSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business field is required'],
    },
    convenience: {
        type:String,
    },
    charges:{
        type:Number,
    }, 
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    }
});


BusinessConvenienceSchema.set('toObject', { virtuals: true });
BusinessConvenienceSchema.set('toJSON', { virtuals: true });

const BusinessConvenience = mongoose.model('BusinessConvenience',BusinessConvenienceSchema,'BusinessConvenience');

module.exports = BusinessConvenience;