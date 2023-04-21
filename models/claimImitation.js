const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt-nodejs'),
config = require('./../config');



const ClaimImitationSchema = new Schema({
    user: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'User field is required'],
    },
    geometry: {
        type: [Number],
        index: '2d'
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    }
});



ClaimImitationSchema.set('toObject', { virtuals: true });

ClaimImitationSchema.set('toJSON', { virtuals: true });


const ClaimImitation = mongoose.model('ClaimImitation', ClaimImitationSchema, 'ClaimImitation');

module.exports = ClaimImitation;