const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CartSchema = new Schema({
    user: {
        type:Schema.ObjectId,
        ref:'User',
    },
    product: {
        type:Schema.ObjectId,
        ref:'BusinessProduct',
    },
    source: {
        type:Schema.ObjectId,
        ref:'Product',
    },
    quantity: {
        type:Number,
        default: 1
    },
    business: {
        type:Schema.ObjectId,
        ref:'User',
    },
    services: [],
    wishlist: {
        type:Boolean,
        default:false
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});



CartSchema.set('toObject', { virtuals: true });
CartSchema.set('toJSON', { virtuals: true });


const Cart = mongoose.model('Cart',CartSchema,'Cart');

module.exports = Cart;