const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HashtagSchema = new Schema({
    post: {
        type:Schema.ObjectId,
        ref:'Post',
    },
    hashtag: {
        type:String,
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

HashtagSchema.set('toObject', { virtuals: true });
HashtagSchema.set('toJSON', { virtuals: true });

const Hashtag = mongoose.model('Hashtag',HashtagSchema,'Hashtag');

module.exports = Hashtag;