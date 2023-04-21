const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PartSchema = new Schema({
    part: {
        type: String,
    },
    cost: {
        type: Number,
    },
    hsn: {
        type: Number,
    },
    tax: {
        type: Number,
    },
});

const ServiceSchema = new Schema({
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
        type: String,
        default: ""
    },
    model: {
        type: Schema.ObjectId,
        ref: 'Model',
        null: true
    },
    _model: {
        type: String,
        default: ""
    },
    package: {
        type: String,
        default: ""
    },
    service: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    segment: {
        type: String,
        default: ""
    },
    labour_cost: {
        type: Number,
        default: 0,
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
        type: Number,
        default: 0,
    },
    of_cost: {
        type: Number,
        default: 0,
    },
    mrp: {
        type: Number,
        default: 0,
    },
    cost: {
        type: Number,
        default: 0,
    },
    profile: {
        type: String,
        default: "",
    },
    fuel: {
        type: String,
        default: ""
    },
    mileage: {
        type: Number,
        default: 0,
    },
    // hours: {
    //     type: Number,
    //     default: 0,
    // },
    hours: {
        type: String,
        default: "",
    },
    quantity: {
        type: Number,
    },
    is_common: {
        type: Boolean,
        default: false
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
        default: "services"
    },

    imported: {
        type: Boolean,
        default: false
    },
    custom: {
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

ServiceSchema.set('toObject', { virtuals: true });
ServiceSchema.set('toJSON', { virtuals: true });

const Service = mongoose.model('Service', ServiceSchema, 'Service');

module.exports = Service;