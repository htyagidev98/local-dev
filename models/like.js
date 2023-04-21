const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
    post: {
        type:Schema.ObjectId,
        ref:'Like',
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

LikeSchema.set('toObject', { virtuals: true });
LikeSchema.set('toJSON', { virtuals: true });

const Like = mongoose.model('Like',LikeSchema,'Like');

module.exports = Like;