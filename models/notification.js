const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    user: {
        type:Schema.ObjectId,
        ref:'User',
        null: true
    },
    activity: {
        type:String,
    },
    model: {
        type:String,
    },
    source: {
        type:Schema.ObjectId
    },
    title: {
        type:String,
    },
    body: {
        type:String,
        default: ""
    },
    status: {
        type: Boolean,
        default: false
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

NotificationSchema.set('toObject', { virtuals: true });
NotificationSchema.set('toJSON', { virtuals: true });

const Notification = mongoose.model('Notification',NotificationSchema,'Notification');

module.exports = Notification;