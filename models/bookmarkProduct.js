const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookmarkProductSchema = new Schema({
    business:{
        type:Schema.ObjectId,
        ref: 'User',
    },
    product:{
        type:Schema.ObjectId,
        ref: 'BusinessProduct',
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

BookmarkProductSchema.set('toObject', { virtuals: true });
BookmarkProductSchema.set('toJSON', { virtuals: true });

const BookmarkProduct = mongoose.model('BookmarkProduct',BookmarkProductSchema,'BookmarkProduct');

module.exports = BookmarkProduct;