const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WebNotificationSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        null: true
    },
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        null: true
    },
    source: {
        type: Schema.ObjectId

    },
    name: {
        type: String,
        default: ""
    },
    assignee: {
        type: Schema.ObjectId,
        ref: 'User',
        null: true
    },
    advisor: {
        type: Schema.ObjectId,
        ref: 'User',
        null: true

    },

    contact_no: {
        type: String,
        default: ""
    },
    type: {
        type: String,
    },
    model: {
        type: String,
    },
    leadSource: {
        type: String

    },

    title: {
        type: String,
    },
    body: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        default: "Unread",
        enum: ["Read", "Unread"],


    },
    carStatus: {
        type: String,

    },
    // leadSource:{
    //     type :String,
    //     default: ""
    // },
    isread: {
        type: Boolean,
        default: false,
    },
    isChecked: {
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

WebNotificationSchema.set('toObject', { virtuals: true });
WebNotificationSchema.set('toJSON', { virtuals: true });

const WebNotification = mongoose.model('WebNotification', WebNotificationSchema, 'WebNotification');

module.exports = WebNotification;