const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var config = require('./../config');

const BusinessUserSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
    },
    user: {
        type:Schema.ObjectId,
        ref:'User',
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

BusinessUserSchema.set('toObject', { virtuals: true });
BusinessUserSchema.set('toJSON', { virtuals: true });

const BusinessUser = mongoose.model('BusinessUser',BusinessUserSchema,'BusinessUser');

module.exports = BusinessUser;