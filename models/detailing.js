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

const DetailingSchema = new Schema({
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

    segment: {
        type: String
    },
    package: {
        type: String
    },
    service: {
        type: String
    },
    description: {
        type: String
    },
    labour_cost: {
        type: Number
    },
    unit: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: "detailing"
    },
    parts: [],
    opening_fitting: [],
    labour: [],
    gallery: [],
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
    quantity: {
        type: Number
    },
    unit: {
        type: String,
        default: ""
    },
    doorstep: {
        type: Boolean,
        default: false
    },
    editable: {
        type: Boolean,
        default: true,
    },
    labour_cost_editable: {
        type: Boolean,
        default: true,
    },
    part_cost_editable: {
        type: Boolean,
        default: true,
    },
    of_cost_editable: {
        type: Boolean,
        default: true,
    },
    amount_is_tax: {
        type: String,
        default: "inclusive",
    },
    tax_info: {},
    publish: {
        type: Boolean,
        default: true
    },
    //Abhinav
    profile: {
        type: String,
        default: "",
    },
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

DetailingSchema.set('toObject', { virtuals: true });
DetailingSchema.set('toJSON', { virtuals: true });

const Detailing = mongoose.model('Detailing', DetailingSchema, 'Detailing');

module.exports = Detailing;