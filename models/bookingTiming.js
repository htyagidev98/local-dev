const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingTimingSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User'
    },
    slot: {
        type:String,
    },
    booking_per_slot: {
        type:Number,
    },
    sort: {
        type:Number,
    },
    category:{
        type:String,
    },
    status: {
        type:Boolean,
        default: true
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

BookingTimingSchema.set('toObject', { virtuals: true });
BookingTimingSchema.set('toJSON', { virtuals: true });

const BookingTiming = mongoose.model('BookingTiming',BookingTimingSchema,'BookingTiming');

module.exports = BookingTiming;