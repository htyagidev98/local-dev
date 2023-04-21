const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');


/*const PriceSchema = new Schema({
    mrp: {
        type:Number,
    },
    rate: {
        type:Number,
    },
    amount: {
        type:Number,
    },
    sell_price: {
        type:Number,
    },
    margin: {
        type:String,
    },
    discount: {
        type:String,
    },
    discount_total:{
        type:Number,
    }
});


const StockSchema = new Schema({
    sku:{
        type:String,
        default: ""
    },
    total: {
        type:Number,
    },
    consumed: {
        type:Number,
    },
    available: {
        type:Number,
    },
});

const SkuSchema = new Schema({
    sku:{
        type:String,
        default: ""
    },
    location: {
        type:Number,
    },
    stock: {
        type:Number,
    },
    available: {
        type:Number,
    },
});
*/
const PurchaseReturnSchema = new Schema({
    vendor: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business ObjectId field is required'],
    },

    vendor_address: {
        type:Schema.ObjectId,
        ref:'Address',
    },

    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business ObjectId field is required'],
    },

    purchase: {
        type:Schema.ObjectId,
        ref:'Purchase',
        required:[true,'Business ObjectId field is required'],
    },
    
    items: {},
    

    bill_no:{
        type: String
    },

    return_no:{
        type: String
    },
    
    reference_no:{
        type: String
    },
    
    date: {
        type:Date,
    },
    
    due_date: {
        type:Date,
    },

    total:{
        type: Number
    },

    status:{
        type: String
    },
    
    created_at: {
        type:Date,
    },

    updated_at: {
        type:Date,
    },
});


PurchaseReturnSchema.virtual('bookmark', {
    ref: 'BookmarkProduct',
    localField: '_id',
    foreignField: 'product'
});

PurchaseReturnSchema.virtual('is_bookmarked').get(function() {
    var bookmark = this.bookmark;
    var status = _.filter(bookmark, {business:mongoose.mongo.ObjectId(loggedInUser)}).length > 0 ? true:false;
    return status;
});

PurchaseReturnSchema.set('toObject', { virtuals: true });
PurchaseReturnSchema.set('toJSON', { virtuals: true });

const PurchaseReturn = mongoose.model('PurchaseReturn',PurchaseReturnSchema,'PurchaseReturn');

module.exports = PurchaseReturn;