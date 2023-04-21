const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var config = require('./../config');

const BusinessSettingSchema = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'Business field is required'],
    },

    job_inspection_limit: {
        type: Number,
        default: 11
    },

    qc_inspection_limit: {
        type: Number,
        default: 11
    },

    skip_insurance_info: {
        type: Boolean,
        default: false
    },

    skip_store_approval: {
        type: Boolean,
        default: false
    },

    skip_qc: {
        type: Boolean,
        default: false
    },

    tax_invoice: {
        type: Boolean,
        default: true
    },
    gst_invoice: {
        type: Boolean,
        default: true
    }
    ,
    created_at: {
        type: Date,
    },

    updated_at: {
        type: Date,
    },
});

BusinessSettingSchema.set('toObject', { virtuals: true });
BusinessSettingSchema.set('toJSON', { virtuals: true });

const BusinessSetting = mongoose.model('BusinessSetting', BusinessSettingSchema, 'BusinessSetting');

module.exports = BusinessSetting;