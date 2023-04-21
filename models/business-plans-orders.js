const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BusinessPlanOrders = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: "User",
        null: true
    },
    amount: {
        type: String
    },
    payment_mode: {
        type: String
    },
    plans: [],
    received_by: {
        type: String
    },
    transaction_id: {
        type: Schema.ObjectId
    },

});

BusinessPlanOrders.set('toObject', { virtuals: true });
BusinessPlanOrders.set('toJSON', { virtuals: true });

const businessplanorders = mongoose.model('BusinessPlanOrders',BusinessPlanOrders,'BusinessPlanOrders');

module.exports = businessplanorders;