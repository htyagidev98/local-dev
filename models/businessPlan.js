const mongoose = require('mongoose');
const Schema = mongoose.Schema;

config = require('./../config')


//Abhinav
const PaymentSchema = new Schema({
    payment_mode: {
        type: String,
        default: ''
    },
    payment_status: {
        type: String,
        default: 'Pending'
    },
    total: {
        type: Number,
        default: 0
    },
    terms: {
        type: String,
        default: ""
    },
    discount: {
        type: Number,
        default: 0
    },
    discount_total: {
        type: Number,
        default: 0
    },
    price: {
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
    payment_log: [],
});
//Abhinav
const DueSchema = new Schema({
    due: {
        type: Number,
        default: 0
    },
    pay: {
        type: Number,
        default: 0
    },
});
//ABHINAV
const BusinessPlanSchema = new Schema({
    suite: {
        type: Schema.ObjectId,
        ref: 'SuitePlan',
    },

    business: {
        type: Schema.ObjectId,
        ref: 'User',
    },

    plan: {
        type: String
    },

    short_name: {
        type: String
    },

    name: {
        type: String
    },

    price: {
        type: Number
    },

    default: [],

    main: [],
    onBoarding: [],

    limits: [],


    category: {
        type: String
    },
    sold_by: {
        type: String
    },
    sold_by: {
        type: String
    },
    status: {
        type: String
    },

    validity: {
        type: Number
    },
    plan_no: {
        type: Number
    },
    created_at: {
        type: Date
    },

    updated_at: {
        type: Date
    },

    expired_at: {
        type: Date
    },
    payment: PaymentSchema,
    due: DueSchema,

});


BusinessPlanSchema.set('toObject', { virtuals: true });
BusinessPlanSchema.set('toJSON', { virtuals: true });

const BusinessPlan = mongoose.model('BusinessPlan', BusinessPlanSchema, 'BusinessPlan');

module.exports = BusinessPlan;
