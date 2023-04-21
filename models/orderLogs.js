const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderLogsSchmea = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    booking: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    vendor: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    log: {
        type: String,
    },
    order: {
        type: Schema.ObjectId,
        ref: 'VendorOrder',
        default: null
    },
    car: {
        type: Schema.ObjectId,
        ref: 'Car',
        default: null
    },
    quotation: {
        type: Schema.ObjectId,
        ref: 'QuotationOrders',
        default: null
    },
    created_at: {
        type: Date
    },
    priceUpdateVendor: {
        type: Schema.ObjectId,
        ref: 'VendorOrder',
        default: null
    },
    old_prices: [],
    updated_prices: [],
    orderDetails: [],
    orderPlaced: []
})


orderLogsSchmea.set('toObject', { virtuals: true });
orderLogsSchmea.set('toJSON', { virtuals: true });

const orders = mongoose.model('OrderLogsSchema', orderLogsSchmea, 'OrderLogsSchema')
module.exports = orders