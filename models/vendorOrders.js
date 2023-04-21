const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');


const ImagesSchema = new Schema({
    file: {
        type: String,
        default: ''
    },
    index: {
        type: Number,
    },
    status: {
        type: String,
        default: 'Active'
    },
    // file_address: {
    //     type: String,
    //     default: ''
    // },
    src: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
})
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
    variant: {
        type: Schema.ObjectId,
        ref: 'Variant'
    },
    registration_no: {
        type: String,
        default: ""
    },
    // registration_no: {
    //     type: Number,
    //     default: 0
    // },
});
const ItemSchema = new Schema({
    item: {
        type: String,
        default: ""
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
        default: "Piece"
    },

    lot: {
        type: Number,
        default: 1
    },
    unit_price: {
        type: Number,
        default: 0
    },
    unit_base_price: {
        type: Number,
        default: 0
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
        default: "18.0% GST"
    },
    tax_info: [],

    status: {
        type: String,
        default: ""
    },
    isChecked: {
        type: Boolean,
        default: false
    },
    remark: {
        type: String,
        default: ""
    },
    part_category: {
        type: String,
        default: "OEM"
    },
    sentDate: {
        type: Date

    },
    images: [ImagesSchema],
    car: CarsSchema,
    part_link: {
        type: String,
        default: ''
    },
    // car: {
    //     type: Schema.ObjectId,
    //     ref: 'QuotationOrders.cars'
    // },
    isMarked: {
        type: Boolean,
        default: false
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
const VendorSchema = new Schema({
    vendor: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },

    business: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },

    booking: {
        type: Schema.ObjectId,
        ref: 'Booking',
        default: null
    },

    car: {
        type: Schema.ObjectId,
        ref: 'Car',
        default: null
    },
    quotation: {
        type: Schema.ObjectId,
        ref: 'QuotationOrders',
        default: null
    },
    order: {
        type: Schema.ObjectId,
        ref: 'Order',
        default: null
    },
    parts: [ItemSchema],
    order_link: {
        type: String
    },

    shop_name: {
        type: String
    },

    contact_no: {
        type: String
    },

    email: {
        type: String
    },
    status: {
        type: String
    },
    isVarified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number,
    },
    isQuotationSubmitted: {
        type: Boolean,
        default: false
    },
    quotationStatus: {
        type: String
    },
    order_no: {
        type: Number
    },
    request_date: {
        type: Date
    },
    created_at: {
        type: Date
    },

    updated_at: {
        type: Date
    },
    order_status: {
        type: String,
        default: 'Created'
    },
    total_amount: {
        type: Number,
        default: 0
    },
    isOrder: {
        type: Boolean,
        default: false
    },
    orderSent: {
        type: Boolean,
        default: false
    },
    remark: {
        type: String,
        default: ''
    },
    address: {
        type: Schema.ObjectId,
        ref: 'Address',
        default: null
    },
    purchase: {
        type: Schema.ObjectId,
        ref: 'Purchase',
        default: null
    },
    isBill: {
        type: Boolean,
        default: false
    },
    request_no: {
        type: Number,
        default: 0
    },
    logs: [logs],
})


// https://s3.ap-south-1.amazonaws.com/careager/partsImages/bd758040-4092-11ec-9777-cf64b8f31158.png
// VendorSchema.virtual('parts.images.file_address').get(function () {
//     console.log("this.file = " + this.file)
//     return 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/partsImages/' + this.file;

// });

// ImagesSchema.virtual('file_address').get(function () {
//     console.log("this.file = " + this.file)
//     return 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/partsImages/' + this.file;

// });
VendorSchema.set('toObject', { virtuals: true });
VendorSchema.set('toJSON', { virtuals: true });

const vendorOrders = mongoose.model('VendorOrder', VendorSchema, 'VendorOrder')
module.exports = vendorOrders