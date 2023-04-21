const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UpdatePhoneSchema = new Schema({
    user: {
        type:Schema.ObjectId,
        ref:'User',
    },

    new: {
        type:String,
    },

    existing: {
        type:String,
    },

    otp: {
        type: Number,
    },

    status: {
        type:Boolean,
        default: false
    },

    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});



UpdatePhoneSchema.set('toObject', { virtuals: true });
UpdatePhoneSchema.set('toJSON', { virtuals: true });


const UpdatePhone = mongoose.model('UpdatePhone',UpdatePhoneSchema,'UpdatePhone');

module.exports = UpdatePhone;