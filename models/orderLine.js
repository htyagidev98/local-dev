const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
    status: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: ""
    },
    activity: {
        type: String,
        default: ""
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    name: {
        type: String
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    }
});

const OrderLineSchema = new Schema({
    order: {
        type: Schema.ObjectId,
        ref: 'Order',
        default: null
    },

    business: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'User field is required'],
    },

    order_no: {
        type: String,
    },

    tracking_no: {
        type: String,
    },

    _category: {
        type: String
    },

    category: {
        type: Schema.ObjectId,
        ref: 'ProductCategory',
        default: null
    },

    subcategory: {
        type: Schema.ObjectId,
        ref: 'ProductCategory',
        default: null
    },

    _subcategory: {
        type: String
    },

    product_brand: {
        type: Schema.ObjectId,
        ref: 'ProductBrand',
        default: null
    },

    _brand: {
        type: String,
    },

    product_model: {
        type: Schema.ObjectId,
        ref: 'ProductModel',
        default: null
    },

    _model: {
        type: String
    },

    product: {
        type: Schema.ObjectId,
        ref: 'BusinessProduct',
        default: null
    },

    source: {
        type: Schema.ObjectId,
        ref: 'Product',
        default: null
    },

    sku: {
        type: String,
        default: ""
    },

    unit: {
        type: String,
        default: ""
    },

    part_no: {
        type: String,
        default: ""
    },

    hsn_sac: {
        type: String,
        default: ""
    },

    title: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    },

    mrp: {
        type: Number,
        default: ""
    },

    selling_price: {
        type: Number,
        default: ""
    },

    base: {
        type: Number,
        default: ""
    },

    issued: {
        type: Boolean,
    },

    added_by_customer: {
        type: Boolean,
        default: false
    },

    quantity: {
        type: Number
    },

    procurement_sla: {
        type: String,
    },

    amount_is_tax: {
        type: String,
    },

    tax: {
        type: String,
    },

    tax_rate: {
        type: Number,
        default: 0
    },

    tax_amount: {
        type: Number,
        default: 0
    },

    tax_info: {},

    status: {
        type: String,
        enum: ['Cancelled', 'Confirmed', 'Dispatch', 'Shipped', 'Delivered'],
        default: 'Confirmed',
        required: [true, 'Status is required']
    },

    rate: {
        type: Number
    },

    amount: {
        type: Number
    },

    discount: {
        type: String,
    },

    discount_total: {
        type: Number,
        default: 0
    },

    services: [],

    delivery_date: {
        type: Date,
    },

    log: [logSchema],
    isInvoice: {
        type: Boolean,
        default: false
    },
    isMarked: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
    },

    updated_at: {
        type: Date,
    },
});


OrderLineSchema.set('toObject', { virtuals: true });
OrderLineSchema.set('toJSON', { virtuals: true });


const OrderLine = mongoose.model('OrderLine', OrderLineSchema, 'OrderLine');

module.exports = OrderLine;
