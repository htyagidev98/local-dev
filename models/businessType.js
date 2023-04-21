const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BusinessTypeSchema = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    business_type: {
        type: Schema.ObjectId,
        ref: 'BusinessType'
    },
    is_added: {
        type: Boolean,
    },
});

BusinessTypeSchema.set('toObject', { virtuals: true });
BusinessTypeSchema.set('toJSON', { virtuals: true });


const BusinessType = mongoose.model('BusinessType', BusinessTypeSchema, 'BusinessType');

module.exports = BusinessType;