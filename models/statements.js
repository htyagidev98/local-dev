const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const StatementsSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        // null: true
    },
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        default: "",
        // enum: ['Purchase', 'Sale', 'Payment-In', 'Payment-Out', 'Renewal', 'Upload']
    },
    type: {
        type: String,
        enum: ['Purchase', 'Sale', 'Payment-In', 'Payment-Out', 'Purchase Cancelled', 'Purchase Returned', 'Sale Cancelled']
    },
    paid_by: {
        type: String,
        default: "Customer"
    },
    activity: {
        type: String,
        default: ""
    },
    source: {
        type: Schema.ObjectId,
        null: true
    },
    bill_id: {
        type: String,
        default: ""
    },
    bill_amount: {
        type: Number,
        default: 0
    },
    transaction_amount: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    paid_total: {
        type: Number,
        default: 0
    },
    due: {
        type: Number,
        default: 0
    },
    payment_status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Success', 'Faliure', 'Cancelled']
    },
    payment_mode: {
        type: String,
        default: 'Cash'
    },
    received_by: {
        type: String,
        default: "",
    },
    transaction_id: {
        type: String,
        default: ""
    },
    // transaction_date: {
    //     type: String,
    //     default: ""
    // },
    transaction_date: {
        type: Date,
        default: ""
    },
    transaction_status: {
        type: String,
        default: "",
        enum: ['Pending', 'Success', 'Faliure', 'Cancelled']
    },
    transaction_response: {
        type: String,
        default: ""
    },
    transaction_type: {
        type: String,
        default: ""
    },
    remark: {
        type: String,
        default: ""
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
});

StatementsSchema.set('toObject', { virtuals: true });
StatementsSchema.set('toJSON', { virtuals: true });

const Statements = mongoose.model('Statements', StatementsSchema, 'Statements');
module.exports = Statements;