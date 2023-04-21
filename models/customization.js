const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PartSchema = new Schema({
    part: {
        type: String
    },
    cost: {
        type: Number
    },
    hsn: {
        type: Number
    },
    tax: {
        type: Number
    },
});

const CustomizationSchema = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        null: true
    },
    automaker: {
        type: Schema.ObjectId,
        ref: 'Automaker',
        null: true
    },
    _automaker: {
        type: String
    },
    model: {
        type: Schema.ObjectId,
        ref: 'Model',
        null: true
    },
    _model: {
        type: String
    },
    for: {
        type: String
    },
    package: {
        type: String,

    },
    service: {
        type: String
    },
    description: {
        type: String
    },
    segment: {
        type: String
    },
    labour_cost: {
        type: Number
    },
    gallery: [],
    unit: {
        type: String,
        default: ""
    },
    parts: [],
    labour: [],
    opening_fitting: [],
    part_cost: {
        type: Number
    },
    of_cost: {
        type: Number
    },
    mrp: {
        type: Number
    },
    cost: {
        type: Number
    },
    mileage: {
        type: Number
    },
    hours: {
        type: Number
    },
    quantity: {
        type: Number
    },
    is_common: {
        type: Boolean,
        default: false
    },
    unit: {
        type: String,
        default: ""
    },
    doorstep: {
        type: Boolean,
        default: false
    },
    part_cost_editable: {
        type: Boolean,
        default: false
    },
    editable: {
        type: Boolean,
        default: true
    },
    labour_cost_editable: {
        type: Boolean,
        default: false
    },
    of_cost_editable: {
        type: Boolean,
        default: false
    },
    publish: {
        type: Boolean,
        default: true
    },
    profile: {
        type: String,
        default: "",
    },
    //Abhinav
    approved: {
        type: Boolean,
        default: false
    },
    admin_verified: {
        type: Boolean,
        default: false
    },
    admin_status: {
        type: String,
        default: "Declined"
    },
    status: {
        type: String,
        default: "Standard"
    },
    //
    type: {
        type: String,
        default: "customization"
    },
    imported: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    custom: {
        type: Boolean,
        default: false
    },
});

CustomizationSchema.set('toObject', { virtuals: true });
CustomizationSchema.set('toJSON', { virtuals: true });

const Customization = mongoose.model('Customization', CustomizationSchema, 'Customization');

module.exports = Customization;