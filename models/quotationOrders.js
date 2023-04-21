const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const VendorsPartsSchema = new Schema({
    title: {
        type: String,
        default: ""
    },
    item_status: {
        type: String,
        default: "Requested"
    },
    unit_price: {
        type: Number,
        default: 1
    },
    quantity: {
        type: Number,
        default: 1
    },
    mrp: {
        type: Number,
        default: 0
    },
    rate: {
        type: Number,
        default: 0
    },
    sell_price: {
        type: Number,
        default: 0
    },
    base: {
        type: Number,
        default: 0
    },
    margin: {
        type: Number,
        default: 0
    },
    models: [],
    amount: {
        type: Number,
        default: 0
    },
    tax_amount: {
        type: Number,
        default: 0
    },
    amount_is_tax: {
        type: String,
        default: ""
    },
    discount: {
        type: Number,
        default: 0
    },
    discount_type: {
        type: String,
        default: ""
    },
    discount_total: {
        type: Number,
        default: 0
    },

    tax_rate: {
        type: Number,
        default: 0
    },
    tax: {
        type: String,
        default: ""
    },
    tax_info: [],
});

const CarsSchema = new Schema({
    title: {
        type: String,
        default: ""
    },
    vin: {
        type: String,
        default: ""
    },
    mfg: {
        type: String,
        default: ""
    },
    registration_no: {
        type: String,
        default: ""
    },
    variant: {
        type: Schema.ObjectId,
        ref: 'Variant'
    },
    created_at: {
        type: Date,
        default: new Date()
    }
    // registration_no: {
    //     type: Number,
    //     default: 0
    // },
});
const ItemSchema = new Schema({
    vendors: [VendorsPartsSchema],
    title: {
        type: String,
        default: ""
    },
    item_status: {
        type: String,
        default: "InComplete"
    },
    sku: {
        type: String,
        default: ""
    },
    hsn_sac: {
        type: String,
        default: ""
    },
    part_no: {
        type: String,
        default: ""
    },

    part_no: {
        type: String,
        default: ""
    },
    unit: {
        type: String,
        default: ""
    },
    lot: {
        type: Number,
        default: 1
    },

    // product: {
    //     // type: Schema.ObjectId,
    //     // ref: 'BusinessProduct',

    // },

});
const logs = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        // required: [true, 'Business ObjectId field is required'],
    },
    activity_by: {
        type: String
    },
    time: {
        type: String
    },
    activity: {
        type: String
    },
    remark: {
        type: String
    },
    status: {
        type: String
    },
    created_at: {
        type: Date
    }
})
const QuotationOrders = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    // orders: [],
    booking: {
        type: Schema.ObjectId,
        red: "Booking",
        default: null
    },
    vendors: [],
    car: {
        type: Schema.ObjectId,
        ref: 'Car',
        default: null
    },
    logs: [logs],
    quotation_no: {
        type: String,
        default: ''
    },
    created_at: { type: Date },
    updated_at: { type: Date },
    quotation_submitted: { type: Number, default: 0 },
    quotation_received: { type: Number, default: 0 },
    buyerRemark: {
        type: String,
        default: ''
    },
    sellerRemark: [],
    order_no: Number,
    status: String,
    cars: [CarsSchema]
})
QuotationOrders.set('toObject', { virtuals: true });
QuotationOrders.set('toJSON', { virtuals: true });

const quotatonOrder = mongoose.model('QuotationOrders', QuotationOrders, 'QuotationOrders')
module.exports = quotatonOrder