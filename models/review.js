const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

const ReviewSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'business ObjectId field is required'],
    },
    user: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'User ObjectId field is required'],
    }, 
    booking: {
        type:Schema.ObjectId,
        ref:'Booking',
    },
    review_points : [],
    rating: {
        type:Number,
        default: 0,
        required:[true,'Rating field is required'],
    },
    recommendation: {
        type:Number,
        default: 0
    },
    review: {
        type:String,
    },
    type: {
        type:String,
        default: "service"
    },
    status: {
        type: Boolean,
        default: true
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

ReviewSchema.set('toObject', { virtuals: true });
ReviewSchema.set('toJSON', { virtuals: true });

const Review = mongoose.model('Review',ReviewSchema,'Review');

module.exports = Review;