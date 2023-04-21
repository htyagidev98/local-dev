const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfferSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
    },
    limit: {
        type:Number
    },
    type:{
    	type: String
    },
    discount: {
        type:Number
    },
    package: {
        type:Number
    },
    mrp:{
        type: Number
    },
    cost:{
    	type: Number
    },
    doorstep:{
        type: Boolean,
        default: false
    }
});


OfferSchema.set('toObject', { virtuals: true });
OfferSchema.set('toJSON', { virtuals: true });

const Offer = mongoose.model('Offer', OfferSchema, 'Offer');
module.exports = Offer;