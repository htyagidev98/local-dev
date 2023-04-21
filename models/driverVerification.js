const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const DriverVerificationSchema = new Schema({
    user: {
        type:Schema.ObjectId,
        ref:'User',
    },
    otp: {
        type: Number,
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});



DriverVerificationSchema.set('toObject', { virtuals: true });
DriverVerificationSchema.set('toJSON', { virtuals: true });


const DriverVerification = mongoose.model('DriverVerification',DriverVerificationSchema,'DriverVerification');

module.exports = DriverVerification;