const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash'),
config = require('./../config');

const ProductOfferSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
        null: true
    },
    
    offers: [],

    offer: {
        type:String,
    },
    description: {
        type:String,
    },
    image: {
        type:String,
        required:[true,'Image field is required'],
    },
    valid_till: {
        type:Date,
    },
    source: {
        type:Schema.ObjectId,
        null: true
    },
    type: {
        type:String,
    },
    publish: {
        type:Boolean,
        default:false,
    },
    isCarEager: {
        type:Boolean,
        default:false,
    },   
    isPromotion: {
        type:Boolean,
        default:false,
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

ProductOfferSchema.virtual('file_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/master/product/offer/'+this.image;
});


ProductOfferSchema.set('toObject', { virtuals: true });
ProductOfferSchema.set('toJSON', { virtuals: true });

const ProductOffer = mongoose.model('ProductOffer',ProductOfferSchema,'ProductOffer');

module.exports = ProductOffer;