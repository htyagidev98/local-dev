const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CouponUsedSchema = new Schema({
    user:{
        type:Schema.ObjectId,
        ref:'User',
    },
    booking:{
        type:Schema.ObjectId,
        ref:'Booking',
        null: true 
    },
    order:{
        type:Schema.ObjectId,
        ref:'Order',
        null: true 
    },
    coupon:{
        type:Schema.ObjectId,
        ref:'Coupon',
    },
    code:{
        type: String
    },
    for:{
        type: String
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

CouponUsedSchema.set('toObject', { virtuals: true });
CouponUsedSchema.set('toJSON', { virtuals: true });

const CouponUsed = mongoose.model('CouponUsed',CouponUsedSchema,'CouponUsed');

module.exports = CouponUsed;