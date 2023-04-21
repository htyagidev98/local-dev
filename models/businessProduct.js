const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var SchemaTypes = mongoose.Schema.Types
var _ = require('lodash');

const SpecificationSchema = new Schema({
    dimension: {
        type: String,
        default: ""
    },
    size: {
        type: String,
        default: ""
    },
    weight: {
        type: String,
        default: ""
    },
    specification: {
        type: String,
        default: ""
    },
    features: {
        type: String,
        default: ""
    },
    alignment: {
        type: String,
        default: "",
    },
    orientation: {
        type: String,
        default: "",
    },
    color: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: ""
    },
    types: []
});

const PriceSchema = new Schema({
    mrp: {
        type: Number,
    },
    rate: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    amount_is_tax: {
        type: String,
        enum: ['inclusive', 'exclusive'],
    },
    sell_price: {
        type: Number,
    },

    unit_price: {
        type: Number,
    },
    margin: {
        type: String,
        default: 0,
    },
    margin_total: {
        type: Number,

    },
    discount: {
        type: Number,
        default: 0,
    },
    discount_type: {
        type: String,
        default: ""
    },
    isDiscount: {
        type: Boolean,
        default: true
    },
    discount_total: {
        type: Number,

    },
    tax_amount: {
        type: Number,
        default: 0
    },
    base: {
        type: Number,

    },
    purchase_price: {
        type: Number,
        default: 0.00
    }
});
const OldPriceSchema = new Schema({
    purchase: {
        type: Schema.ObjectId,
        ref: 'Purchase',
        default: null
    },
    mrp: {
        type: Number,
    },
    rate: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    amount_is_tax: {
        type: String,
        enum: ['inclusive', 'exclusive'],
    },
    sell_price: {
        type: Number,
    },
    unit_price: {
        type: Number,
    },
    margin: {
        type: String,
    },
    margin_total: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    discount_type: {
        type: String,
        default: ""
    },
    discount_total: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date
    }
});
const StockSchema = new Schema({
    total: {
        type: Number,
        default: 0
    },
    consumed: {
        type: Number,
        default: 0
    },
    available: {
        type: Number,
        default: 0
    },
});
const SkuSchema = new Schema({
    sku: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    total: {
        type: Number,
        default: 0
    },
    available: {
        type: Number,
        default: 0
    },
    purchase: {
        type: Schema.ObjectId,
        ref: 'Purchase',
        default: null
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
});
const logs = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    purchase: {
        type: Schema.ObjectId,
        ref: 'Purchase',
    },
    booking: {
        type: Schema.ObjectId,
        ref: 'Booking',
    },
    name: {
        type: String,
        default: ""
    },
    vendor_name: {
        type: String,
        default: ""
    },
    car: {
        type: Schema.ObjectId,
        ref: 'Car',
    },
    type: {
        type: String,
        enum: ['Purchased', 'Returned', 'Issued', 'Uninstalled', "Created", "Deleted", "Updated"],
        default: ""
    },
    received_by: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number,
        default: 0
    },
    business: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    unit_price: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    activity: {
        type: String,
        enum: ['Purchased', 'Returned', 'Issued', 'Uninstalled', "New Item Created"],
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
    },
});
const WarrantySchema = new Schema({
    warranty: {
        type: String,
    },
    domestic: {
        type: String,
    },
    international: {
        type: String,
    },
    summary: {
        type: String,
    },
    service_type: {
        type: String,
    },
    covered: {
        type: String,
    },
    not_covered: {
        type: String,
    },
});

const ServiceSchema = new Schema({
    service: {
        type: String
    },
    category: {
        type: String
    },
    discount_type: {
        type: String
    },
    discount: {
        type: Number
    }
});

const BusinessProductSchema = new Schema({
    product: {
        type: Schema.ObjectId,
        ref: 'Product',
        default: null
    },

    purchase: {
        type: Schema.ObjectId,
        ref: 'Purchase',
        default: null
    },

    business: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'Business ObjectId field is required'],
    },
    part_category: {
        type: String,
        enum: ["OEM", "OES"]
    },
    purchases: [],
    price: PriceSchema,
    // oldPrice: [OldPriceSchema],
    additional_price: {},
    stock: StockSchema,
    sku: [SkuSchema],
    services: [ServiceSchema],
    specification: SpecificationSchema,
    warranty: WarrantySchema,
    tax_info: {},

    tax_rate: {
        type: Number
    },
    amount_is_tax: {
        type: String,
        default: "inclusive"
    },

    tax: {
        type: String,
    },

    tax_type: {
        type: String,
        default: "GST"
    },

    product_brand: {
        type: Schema.ObjectId,
        ref: 'ProductBrand',
        null: true
    },
    _product_brand: {
        type: String,
        default: ""
    },
    product_model: {
        type: Schema.ObjectId,
        ref: 'ProductModel',
        null: true
    },
    _product_model: {
        type: String,
        default: ""
    },
    category: {
        type: Schema.ObjectId,
        ref: 'ProductCategory',
        null: true
    },
    _category: {
        type: String,
        default: ""
    },
    subcategory: {
        type: Schema.ObjectId,
        ref: 'ProductCategory',
        null: true
    },
    _subcategory: {
        type: String,
        default: ""
    },
    product_id: {
        type: Number
    },
    reference_no: {
        type: String,
        default: ""
    },

    part_no: {
        type: String,
        default: ""
    },
    // oem: {
    //     type: String,
    //     default: ""
    // },
    // oes: {
    //     type: String,
    //     default: ""
    // },

    models: [],
    keywords: [],

    title: {
        type: String,
        text: true
    },

    short_description: {
        type: String,
        default: ""
    },

    long_description: {
        type: String,
        default: ""
    },

    hsn_sac: {
        type: String
    },

    list_type: [],

    thumbnail: {
        type: String,
        default: ""
    },

    type: {
        type: String,
        default: ""
    },

    procurement_sla: {
        type: Number,
        default: 3
    },

    convenience_charges: {
        type: Number,
        default: 0
    },

    unit: {
        type: String,
        enum: ['KG', 'MG', 'Gram', 'Piece', 'Litre', 'L', 'ML', 'Pack', 'Unit', 'Set', 'Battery', 'Tyre'],
        default: 'Unit'
    },
    quantity: {
        type: Number
    },

    publish: {
        type: Boolean,
        default: false
    },
    transfered: {
        type: Boolean,
        default: false
    },

    variants: [
        {
            type: Schema.ObjectId,
            ref: 'BusinessProduct',
        }
    ],

    logs: [logs],

    created_at: {
        type: Date,
    },

    updated_at: {
        type: Date,
    },
});


BusinessProductSchema.virtual('bookmark', {
    ref: 'BookmarkProduct',
    localField: '_id',
    foreignField: 'product'
});

BusinessProductSchema.virtual('is_bookmarked').get(function () {
    var bookmark = this.bookmark;
    var status = _.filter(bookmark, { business: mongoose.mongo.ObjectId(loggedInUser) }).length > 0 ? true : false;
    return status;
});

BusinessProductSchema.virtual('preview').get(function () {
    return 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/master/product/300/' + this.thumbnail;
});

BusinessProductSchema.set('toObject', { virtuals: true });
BusinessProductSchema.set('toJSON', { virtuals: true });

const BusinessProduct = mongoose.model('BusinessProduct', BusinessProductSchema, 'BusinessProduct');

module.exports = BusinessProduct;