const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowSchema = new Schema({
    user:{
        type:Schema.ObjectId,
        ref: 'User',
    },
    follow:{
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

FollowSchema.set('toObject', { virtuals: true });
FollowSchema.set('toJSON', { virtuals: true });

const Follow = mongoose.model('Follow',FollowSchema,'Follow');

module.exports = Follow;