const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

const ClaimBusinessSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business ObjectId field is required'],
    },
    email: {
        type:String,
    },
    phone: {
        type:String,
        required:[true,'Phone field is required'],
    },
    description: {
        type:String,
        required:[true,'Description field is required'],
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

ClaimBusinessSchema.set('toObject', { virtuals: true });
ClaimBusinessSchema.set('toJSON', { virtuals: true });

const ClaimBusiness = mongoose.model('ClaimBusiness',ClaimBusinessSchema,'ClaimBusiness');

module.exports = ClaimBusiness;