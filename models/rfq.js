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

const RFQSchema = new Schema({
    vendors: [
        {
            type:Schema.ObjectId,
            ref:'BusinessVendor',
        }
    ],

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
    
    items: [],
    emails: [],
    
    vin:{
        type: String,
        default: ""
    },  

    rfq_no:{
        type: String,
        default: ""
    },     

    note:{
        type: String,
        default: ""
    },    

    memo:{
        type: String,
        default: ""
    },    
    
    date: {
        type:Date,
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


RFQSchema.set('toObject', { virtuals: true });
RFQSchema.set('toJSON', { virtuals: true });

const RFQ = mongoose.model('RFQ',RFQSchema,'RFQ');

module.exports = RFQ;