const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookmarkCarSchema = new Schema({
    user:{
        type:Schema.ObjectId,
        ref: 'User',
    },
    car:{
        type:Schema.ObjectId,
        ref: 'BusinessCar',
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

BookmarkCarSchema.set('toObject', { virtuals: true });
BookmarkCarSchema.set('toJSON', { virtuals: true });

const BookmarkCar = mongoose.model('BookmarkCar',BookmarkCarSchema,'BookmarkCar');

module.exports = BookmarkCar;