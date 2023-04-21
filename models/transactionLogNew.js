const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionLogSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        null: true
    },
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    plan_no: {
        type: Number
    },
    status: {
        type: String,
        default: "",
        // enum: ['Purchase', 'Sale', 'Payment-In', 'Payment-Out', 'Renewal', 'Upload']
    },
    type: {
        type: String,
        default: "",
        enum: ['Purchase', 'Sale', 'Payment-In', 'Payment-Out', 'received']
    },
    paid_by: {
        type: String,
        default: "Customer"
    },
    payment_in: {
        type: Number,
        default: 0
    },
    payment_out: {
        type: Number,
        default: 0
    },
    activity: {
        type: String,
        default: ""
    },
    source: {
        type: Schema.ObjectId,
        null: true
    },
    payment_status: {
        type: String,
        default: 'Pending'
    },
    payment_mode: {
        type: String,
        default: 'paytm'
    },
    total: {
        type: Number,
    },
    paid_total: {
        type: Number,
        default: 0
    },
    due: {
        type: Number,
        default: 0
    },
    order_id: {
        type: String,
    },
    transaction_id: {
        type: String,
        default: ""
    },
    transaction_date: {
        type: String,
        default: ""
    },
    transaction_status: {
        type: String,
        default: ""
    },
    transaction_response: {
        type: String,
        default: ""
    },
    transaction_type: {
        type: String,
        default: ""
    },
    // type: {
    //     type: String,
    //     default: "received"
    // },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    received_by: {
        type: String,
    }
});

TransactionLogSchema.set('toObject', { virtuals: true });
TransactionLogSchema.set('toJSON', { virtuals: true });

const TransactionLog = mongoose.model('TransactionLog', TransactionLogSchema, 'TransactionLog');
module.exports = TransactionLog;