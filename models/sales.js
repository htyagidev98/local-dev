const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PartsSchema = new Schema({
    part_category: {
        type: String,
        enum: ["OEM", "OES"]
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
        default: "Piece"
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
        default: 0
    },

    selling_price: {
        type: Number,
        default: 0
    },
    base: {
        type: Number,
        default: 0
    },
    unit_base_price: {
        type: Number,
        default: 0
    },
    unit_price: {
        type: Number,
        default: 0
    },
    issued: {
        type: Boolean,
        default: false
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
        default: 'exclusive'
    },

    tax: {
        type: String,
        default: ""
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
        enum: ['Cancelled', 'Confirmed', 'Returned'],
        default: 'Confirmed',
        required: [true, 'Status is required']
    },
    rate: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    },

    discount: {
        type: String,
    },

    discount_total: {
        type: Number,
        default: 0
    },
    isInvoice: {
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

const LaboursSchema = new Schema({
    unit: {
        type: String,
        default: "Piece"
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
        default: 0
    },

    selling_price: {
        type: Number,
        default: 0
    },
    base: {
        type: Number,
        default: 0
    },
    unit_base_price: {
        type: Number,
        default: 0
    },
    unit_price: {
        type: Number,
        default: 0
    },

    quantity: {
        type: Number
    },

    amount_is_tax: {
        type: String,
        default: 'exclusive'
    },

    tax: {
        type: String,
        default: ""
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
        enum: ['Cancelled', 'Confirmed', 'Returned'],
        default: 'Confirmed',
        required: [true, 'Status is required']
    },
    rate: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    },

    discount: {
        type: String,
    },

    discount_total: {
        type: Number,
        default: 0
    },
    isInvoice: {
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
const PaymentSchema = new Schema({
    payment_mode: {
        type: String,
        enum: ['Online', 'POD', ''],
        default: ''
    },
    payment_status: {
        type: String,
        enum: ['', 'Success', 'Failure'],
        default: ''
    },
    total: {
        type: Number,
    },
    extra_charges_limit: {
        type: Number,
        default: 0
    },
    convenience_charges: {
        type: Number,
        default: 0
    },
    terms: {
        type: String,
        default: "REFUND POLICY \nAll sales on the CarEager Platform are final with no refund or exchange permitted. However, if in a transaction, money is charged to your card or bank account but the order is not confirmed within 48 hours of the completion of the transaction, then you shall inform us by sending an e-mail to care@CarEager.com or by calling on our toll-free number. The following details needs to be provided – mobile number, transaction date, and order number. CarEager would investigate the incident and, if it is found that money was indeed charged without any valid order, then you will be refunded the money within 21 working days from the date of receipt of your e-mail. \n\nWARRANTY CLAIMS \nCarEager is not a warrantor of the products/services listed on CarEager platform which are offered by other manufacturers, Merchants, or vendors. You understand that any issue or dispute regarding the warranty, guarantee, quality, and service will be addressed as per the terms & conditions of the manufacturers, merchants, or suppliers, and you agree to handle such issues and disputes directly with the manufacturers, Merchants, or vendors. However, CarEager would assist you in getting the best after sale services."
    },
    discount_type: {
        type: String,
        default: ""
    },
    coupon_type: {
        type: String,
        default: ""
    },
    coupon: {
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
    order_discount: {
        type: Number,
        default: 0
    },
    paid_total: {
        type: Number,
        default: 0
    },
    discount_applied: {
        type: Boolean,
        default: false
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
    }
});


const DueSchema = new Schema({
    due: {
        type: Number,
        default: 0
    }
});

const StatusSchema = new Schema({
    status: {
        type: String,
        default: ""
    },
    type: {
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
    }
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
const SalesSchema = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    created_by: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    address: {
        type: Schema.ObjectId,
        ref: 'Address',
        default: null
    },
    delivery_date: {
        type: Date,
        default: null
    },
    due_date: {
        type: Date,
        default: null
    },
    sale_no: {
        type: String,
        default: ''
    },

    note: {
        type: String,
        default: ""
    },
    reference_no: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['Cancelled', 'Confirmed', 'Delivered', 'Returned', 'Open'],
        default: 'Open',

    },
    // log: [StatusSchema],
    payment: PaymentSchema,
    due: DueSchema,
    parts: [PartsSchema],
    labours: [LaboursSchema],
    isInvoice: {
        type: Boolean,
        default: false
    },
    invoice: {
        type: Schema.ObjectId,
        ref: 'OrderInvoice',
        null: true
    },
    logs: [logs],
    created_at: {
        type: Date,
    },
    isParchi: {
        type: Boolean,
        default: false,
    },
    parchi: {
        type: Schema.ObjectId,
        ref: 'Parchi',
        default: null
    },
    updated_at: {
        type: Date,
    },
});

SalesSchema.set('toObject', { virtuals: true });
SalesSchema.set('toJSON', { virtuals: true });

const Sales = mongoose.model('Sales', SalesSchema, 'Sales');

module.exports = Sales;