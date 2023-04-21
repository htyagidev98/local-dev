const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrandLikeSchema = new Schema({
    automaker: {
        type:Schema.ObjectId,
        ref:'Automaker',
        null: true
    },
    user: {
        type:Schema.ObjectId,
        ref:'User',
        null: true
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

BrandLikeSchema.set('toObject', { virtuals: true });
BrandLikeSchema.set('toJSON', { virtuals: true });

const BrandLike = mongoose.model('BrandLike',BrandLikeSchema,'BrandLike');

module.exports = BrandLike;