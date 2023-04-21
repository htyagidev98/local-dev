const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingServiceSchema = new Schema({
    booking:{
    	type:Schema.ObjectId,
        ref:'Booking',
    },
    category:{
        type: String
    },
    source:{
        type:Schema.ObjectId,
        default: null,
    },
    service:{
    	type: String
    },
    description:{
    	type: String
    },
    cost:{
    	type: Number
    }
});

BookingServiceSchema.set('toObject', { virtuals: true });
BookingServiceSchema.set('toJSON', { virtuals: true });

const BookingService = mongoose.model('BookingService',BookingServiceSchema,'BookingService');

module.exports = BookingService;