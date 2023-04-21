const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostViewSchema = new Schema({
    post:{
        type:Schema.ObjectId,
        ref: 'Post',
    },
    user:{
        type:Schema.ObjectId,
        ref: 'User',
        default: null
    },
    timezone: {
        type: String,
    },
    country: {
        type: String 
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

PostViewSchema.set('toObject', { virtuals: true });
PostViewSchema.set('toJSON', { virtuals: true });

const PostView = mongoose.model('PostView',PostViewSchema,'PostView');

module.exports = PostView;