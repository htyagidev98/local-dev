const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

const ReviewPointSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'business ObjectId field is required'],
    },
    rating : {
        type:Number,
    },
    points : [],
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

ReviewPointSchema.set('toObject', { virtuals: true });
ReviewPointSchema.set('toJSON', { virtuals: true });

const ReviewPoint = mongoose.model('ReviewPoint',ReviewPointSchema,'ReviewPoint');

module.exports = ReviewPoint;
