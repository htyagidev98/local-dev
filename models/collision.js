const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CollisionSchema = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        null: true
    },
    _automaker: {
        type: String
    },
    automaker: {
        type: Schema.ObjectId,
        ref: 'Automaker',
        null: true
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
        type: String,
        default: ""
    },
    service: {
        type: String
    },
    description: {
        type: String
    },
    labour: [],
    gallery: [],
    opening_fitting: [],
    labour_cost: {
        type: Number
    },
    package: {
        type: String
    },
    parts: [],
    part_cost: {
        type: Number
    },
    of_cost: {
        type: Number
    },
    cost: {
        type: Number
    },
    mrp: {
        type: Number
    },
    doorstep: {
        type: Boolean,
        default: false
    },
    unit: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number
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
    type: {
        type: String,
        default: "collision"
    },
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


CollisionSchema.set('toObject', { virtuals: true });
CollisionSchema.set('toJSON', { virtuals: true });

const Collision = mongoose.model('Collision', CollisionSchema, 'Collision');
module.exports = Collision;