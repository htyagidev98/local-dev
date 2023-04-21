const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

// const ItemSchema = new Schema({
//     title: {
//         type: String,
//         default: ""
//     },
//     item_status: {
//         type: String,
//         default: "InComplete"
//     },
//     sku: {
//         type: String,
//         default: ""
//     },
//     hsn_sac: {
//         type: String,
//         default: ""
//     },
//     part_no: {
//         type: String,
//         default: ""
//     },
//     oem: {
//         type: String,
//         default: ""
//     },
//     oes: {
//         type: String,
//         default: ""
//     },
//     part_no: {
//         type: String,
//         default: ""
//     },
//     unit: {
//         type: String,
//         default: ""
//     },
//     stock: {
//         type: Number,
//         default: 1
//     },
//     lot: {
//         type: Number,
//         default: 1
//     },
//     unit_price: {
//         type: Number,
//         default: 1
//     },
//     quantity: {
//         type: Number,
//         default: 1
//     },
//     mrp: {
//         type: Number,
//         default: 0
//     },
//     rate: {
//         type: Number,
//         default: 0
//     },
//     sell_price: {
//         type: Number,
//         default: 0
//     },
//     base: {
//         type: Number,
//         default: 0
//     },
//     margin: {
//         type: Number,
//         default: 0
//     },
//     models: [],
//     amount: {
//         type: Number,
//         default: 0
//     },
//     tax_amount: {
//         type: Number,
//         default: 0
//     },
//     amount_is_tax: {
//         type: String,
//         default: ""
//     },
//     discount: {
//         type: Number,
//         default: 0
//     },
//     discount_type: {
//         type: String,
//         default: ""
//     },
//     discount_total: {
//         type: Number,
//         default: 0
//     },

//     tax_rate: {
//         type: Number,
//         default: 0
//     },
//     tax: {
//         type: String,
//         default: ""
//     },
//     tax_info: [],
//     // product: {
//     //     // type: Schema.ObjectId,
//     //     // ref: 'BusinessProduct',

//     // },

// });
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

const PurchaseSchema = new Schema({
    vendor: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'Business ObjectId field is required'],
    },

    vendor_address: {
        type: Schema.ObjectId,
        ref: 'Address',
        default: null
    },

    business: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'Business ObjectId field is required'],
    },
    vendorOrder: {
        type: Schema.ObjectId,
        ref: 'VendorOrder',
        default: null
        // required: [true, 'Business ObjectId field is required'],
    },
    // items: [ItemSchema],
    items: [],

    bill_no: {
        type: String
    },

    reference_no: {
        type: String
    },

    date: {
        type: Date,
    },

    due_date: {
        type: Date,
    },

    total: {
        type: Number
    },
    bill_discount: {
        type: String
    },
    total_discount: {
        type: Number
    },
    // payable_amount: {
    //     type: Number
    // },
    paid_total: {
        type: Number
    },
    due: {
        type: Number
    },
    subTotal: {
        type: Number
    },
    status: {
        type: String
    },
    attachment: {
        type: String
    },
    file_name: {
        type: String
    },
    isProduct: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
    },
    logs: [logs],
    bill_url: {
        type: String,
        default: ''
    },
    updated_at: {
        type: Date,
    },
});


PurchaseSchema.virtual('bookmark', {
    ref: 'BookmarkProduct',
    localField: '_id',
    foreignField: 'product'
});

PurchaseSchema.virtual('is_bookmarked').get(function () {
    var bookmark = this.bookmark;
    var status = _.filter(bookmark, { business: mongoose.mongo.ObjectId(loggedInUser) }).length > 0 ? true : false;
    return status;
});

PurchaseSchema.set('toObject', { virtuals: true });
PurchaseSchema.set('toJSON', { virtuals: true });

const Purchase = mongoose.model('Purchase', PurchaseSchema, 'Purchase');

module.exports = Purchase;


