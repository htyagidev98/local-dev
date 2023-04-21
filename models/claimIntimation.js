const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt-nodejs'),
config = require('./../config');



const ClaimIntimationchema = new Schema({
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



ClaimIntimationchema.set('toObject', { virtuals: true });

ClaimIntimationchema.set('toJSON', { virtuals: true });


const ClaimIntimation = mongoose.model('ClaimIntimation', ClaimIntimationchema, 'ClaimIntimation');

module.exports = ClaimIntimation;