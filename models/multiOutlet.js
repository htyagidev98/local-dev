const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');



const ManagementSchema = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'business ObjectId field is required'],
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'User ObjectId field is required'],
    },
    address: {
        type: Schema.ObjectId,
        ref: 'Address',
        required: [true, 'Address ObjectId field is required'],
    },
    department: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: "Franchise "
    },
    permissions: [],
    status: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    }
});

ManagementSchema.set('toObject', { virtuals: true });
ManagementSchema.set('toJSON', { virtuals: true });

const Management = mongoose.model('Management', ManagementSchema, 'Management');

module.exports = Management;