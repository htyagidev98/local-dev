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

const PurchaseOrderSchema = new Schema({
    vendor: {
        type:Schema.ObjectId,
        ref:'BusinessVendor',
        required:[true,'Business ObjectId field is required'],
    },

    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business ObjectId field is required'],
    },

    quotation: {
        type:Schema.ObjectId,
        ref:'Quotation',
        default: null,
    },
    
    items: [],
    
    ship_to:{
        type: String
    }, 

    order_no:{
        type: String
    },    

    mailing_address:{
        type: String
    },    
  

    message:{
        type: String
    },    

    memo:{
        type: String
    },    

    reference_no:{
        type: String
    },    
    
    date: {
        type:Date,
    },

    total:{
        type: Number
    }, 

    quantity:{
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

PurchaseOrderSchema.set('toObject', { virtuals: true });
PurchaseOrderSchema.set('toJSON', { virtuals: true });

const PurchaseOrder = mongoose.model('PurchaseOrder',PurchaseOrderSchema,'PurchaseOrder');

module.exports = PurchaseOrder;