const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

const TaxSchema = new Schema({
    tax: {
        type: String,
    },
    rate: {
        type: Number,
    },
    type: {
        type: String,
    },
    count: {
        type: Number,
    },
    detail: {},
    country: {
        type: Schema.ObjectId,
        ref: 'Country',
        null: true
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
});

const Tax = mongoose.model('Tax', TaxSchema, 'Tax');

module.exports = Tax;