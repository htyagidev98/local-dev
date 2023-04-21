const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BusinessTimingSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User'
    },
    day: {
        type:String,
    },
    open: {
        type:String,
    },
    close: {
        type:String,
    },
    is_closed: {
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

BusinessTimingSchema.set('toObject', { virtuals: true });
BusinessTimingSchema.set('toJSON', { virtuals: true });

const BusinessTiming = mongoose.model('BusinessTiming',BusinessTimingSchema,'BusinessTiming');

module.exports = BusinessTiming;