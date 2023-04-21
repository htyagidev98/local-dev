const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileViewSchema = new Schema({
    profile:{
        type:Schema.ObjectId,
        ref: 'User',
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

ProfileViewSchema.set('toObject', { virtuals: true });
ProfileViewSchema.set('toJSON', { virtuals: true });

const ProfileView = mongoose.model('ProfileView',ProfileViewSchema,'ProfileView');

module.exports = ProfileView;