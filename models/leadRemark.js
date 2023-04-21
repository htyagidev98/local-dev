const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadFollowUpSchema = new Schema({
    date: {
        type: Date,
        default: null
    },
    time: {
        type: String,
        default: ""
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    }
});
const LeadRemarkSchema = new Schema({
    lead: {
        type: Schema.ObjectId,
        ref: 'Lead',
        default: null,
    },
    assignee: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null,
    },
    isRemark: {
        type: Boolean,
        default: false
    },
    isResponse: {
        type: Boolean,
        default: false
    },
    customer_remark: {
        type: String,
        default: ""
    },
    assignee_remark: {
        type: String,
        default: ""
    },
    resource: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: ""
    },
    source: {
        type: String,
        default: ""
    },
    status: {
        type: String
    },
    reason: {
        type: String,
        default: ""
    },
    follow_up: LeadFollowUpSchema,
    color_code: {
        type: String
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    }
});

LeadRemarkSchema.set('toObject', { virtuals: true });
LeadRemarkSchema.set('toJSON', { virtuals: true });

const LeadRemark = mongoose.model('LeadRemark', LeadRemarkSchema, 'LeadRemark');

module.exports = LeadRemark;