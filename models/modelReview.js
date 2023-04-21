const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

const ModelReviewSchema = new Schema({
    model: {
        type:Schema.ObjectId,
        ref:'Model',
        required:[true,'Model ObjectId field is required'],
    },
    user: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'User ObjectId field is required'],
    },
    rating: {
        type:Number,
        required:[true,'Rating field is required'],
    },
    review: {
        type:String,
        required:[true,'ModelReview field is required'],
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

ModelReviewSchema.set('toObject', { virtuals: true });
ModelReviewSchema.set('toJSON', { virtuals: true });

const ModelReview = mongoose.model('ModelReview',ModelReviewSchema,'ModelReview');

module.exports = ModelReview;