const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookmarkModelSchema = new Schema({
    user:{
        type:Schema.ObjectId,
        ref: 'User',
    },
    model:{
        type:Schema.ObjectId,
        ref: 'Model',
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

BookmarkModelSchema.set('toObject', { virtuals: true });
BookmarkModelSchema.set('toJSON', { virtuals: true });

const BookmarkModel = mongoose.model('BookmarkModel',BookmarkModelSchema,'BookmarkModel');

module.exports = BookmarkModel;