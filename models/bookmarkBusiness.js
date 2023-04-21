const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookmarkBusinessSchema = new Schema({
    user:{
        type:Schema.ObjectId,
        ref: 'User',
    },
    business:{
        type:Schema.ObjectId,
        ref: 'User',
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

BookmarkBusinessSchema.set('toObject', { virtuals: true });
BookmarkBusinessSchema.set('toJSON', { virtuals: true });

const BookmarkBusiness = mongoose.model('BookmarkBusiness',BookmarkBusinessSchema,'BookmarkBusiness');

module.exports = BookmarkBusiness;