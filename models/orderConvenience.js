const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderConvenienceSchema = new Schema({
	business: {
        type:Schema.ObjectId,
        ref:'User',
        null:true
    },
    convenience: {
        type: String
    },
    chargeable:{
        type: Boolean,
        default: false
    },
    charges:{
        type: Number,
        default: 0
    }
});

OrderConvenienceSchema.set('toObject', { virtuals: true });
OrderConvenienceSchema.set('toJSON', { virtuals: true });

const OrderConvenience = mongoose.model('OrderConvenience',OrderConvenienceSchema,'OrderConvenience');

module.exports = OrderConvenience;