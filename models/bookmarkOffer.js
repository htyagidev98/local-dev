const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookmarkOfferSchema = new Schema({
    user:{
        type:Schema.ObjectId,
        ref: 'User',
    },
    offer:{
        type:Schema.ObjectId,
        ref: 'BusinessOffer',
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

BookmarkOfferSchema.set('toObject', { virtuals: true });
BookmarkOfferSchema.set('toJSON', { virtuals: true });




const BookmarkOffer = mongoose.model('BookmarkOffer',BookmarkOfferSchema,'BookmarkOffer');



module.exports = BookmarkOffer;