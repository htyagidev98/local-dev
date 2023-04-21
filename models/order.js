const mongoose = require('mongoose');
const Schema = mongoose.Schema;


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
    order_discount: {
        type: Number,
        default: 0
    },
    discount_total: {
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
    },
    pay: {
        type: Number,
        default: 0
    },
});

const OrderSchema = new Schema({
    car: {
        type: Schema.ObjectId,
        ref: 'Variant',
        default: null
    },

    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'User field is required'],
    },
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        // required: [true, 'User field is required'],
    },
    address: {
        type: Schema.ObjectId,
        ref: 'Address',
        null: true
    },

    convenience: {
        type: String
    },

    status: {
        type: String,
        enum: ['Ordered', 'Cancelled', 'Dispatched', 'Shipped', 'Delivered'],
        default: 'Ordered',
        required: [true, 'Status is required']
    },

    order_no: {
        type: String,
    },

    payment: PaymentSchema,

    due: DueSchema,
    isInvoice: {
        type: Boolean,
        default: false
    },
    invoice: {
        type: Schema.ObjectId,
        ref: 'OrderInvoice',
        null: true
    },
    isPurchaseOrder: {
        type: Boolean,
        default: false
    },
    vendorOrder: {
        type: Schema.ObjectId,
        ref: 'vendorOrder',
        null: true
    },
    request_no: {
        type: Number,
        default: 0
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
    created_at: {
        type: Date,
    },

    updated_at: {
        type: Date,
    }
});


OrderSchema.set('toObject', { virtuals: true });
OrderSchema.set('toJSON', { virtuals: true });


const Order = mongoose.model('Order', OrderSchema, 'Order');

module.exports = Order;
