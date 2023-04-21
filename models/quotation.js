const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');


const PriceSchema = new Schema({
    mrp: {
        type:Number,
    },
    rate: {
        type:Number,
    },
    amount: {
        type:Number,
    }
});

const LogSchema = new Schema({
    status:{
        type:String,
        default: ""
    },
    remark: {
        type:String,
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

const QuotationSchema = new Schema({
    vendor: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business ObjectId field is required'],
    },

    rfq: {
        type:Schema.ObjectId,
        ref:'RFQ',
    },

    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business ObjectId field is required'],
    },

    address: {
        type:Schema.ObjectId,
        ref:'Address',
        default: null
    },

    vendor_address: {
        type:Schema.ObjectId,
        ref:'Address',
        default: null
    },
    
    items: [],
    
    quotation_no:{
        type: String
    },    

    note:{
        type: String
    },    

    memo:{
        type: String
    },    
    
    date: {
        type:Date,
    },

    total:{
        type: Number
    }, 

    status: {
        type:String,
        enum: ['Open','Close'],
        default : 'Open'
    },

    log: [LogSchema],
    
    created_at: {
        type:Date,
    },

    updated_at: {
        type:Date,
    },
});

QuotationSchema.set('toObject', { virtuals: true });
QuotationSchema.set('toJSON', { virtuals: true });

const Quotation = mongoose.model('Quotation',QuotationSchema,'Quotation');

module.exports = Quotation;