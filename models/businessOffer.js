const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash'),
    config = require('./../config');
//Abhinav
const OfferDetailsSchema = new Schema({
    terms: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: 0
    },
});
const BusinessOfferSchema = new Schema({

    business: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'Business ObjectId field is required'],
    },
    offer: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        required: [true, 'Image field is required'],
    },
    featured_image: {
        type: String,
    },
    valid_till: {
        type: String,

    },
    source: {
        type: String,
    },
    publish: {
        type: Boolean,
        default: false,
    },//Abhinav

    featured: {
        type: Boolean,
        default: false,
    },


    terms: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        default: ""
    },
    code: {
        type: String,
        default: ""
    },
    limit: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        default: ""
    },
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date,
    },
    discount: {
        type: Number
    },
    //Abhinav
    isCarEager: {
        type: Boolean,
        default: false,
    },
    isPromotion: {
        type: Boolean,
        default: false,
    },
    multi_category: {
        type: String,
        default: ""
    },
    validity: {
        type: Number,
        default: 0,
        required: [true, 'Validity field is required'],
    },

    geometry: {
        type: [Number],
        index: '2d'
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
});

BusinessOfferSchema.virtual('file_address').get(function () {
    return 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/offer/' + this.image;
});
BusinessOfferSchema.virtual('features_address').get(function () {
    return 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/offer/' + this.featured_image;
});


BusinessOfferSchema.virtual('bookmark', {
    ref: 'BookmarkOffer',
    localField: '_id',
    foreignField: 'offer'
});


BusinessOfferSchema.virtual('is_bookmarked').get(function () {
    var bookmark = this.bookmark;
    console.log(bookmark)
    var status = _.filter(bookmark, { user: mongoose.mongo.ObjectId(loggedInUser) }).length > 0 ? true : false;
    return status;
});

BusinessOfferSchema.set('toObject', { virtuals: true });
BusinessOfferSchema.set('toJSON', { virtuals: true });

const BusinessOffer = mongoose.model('BusinessOffer', BusinessOfferSchema, 'BusinessOffer');

module.exports = BusinessOffer;