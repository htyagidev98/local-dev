const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivityLogSchema = new Schema({
    user: {
        type:Schema.ObjectId,
        ref:'User',
        null: true
    },
    activity: {
        type:String,
    },
    tag: {
        type:String,
    },
    source: {
        type:Schema.ObjectId,
        null: true
    },   
    modified: {
        type:String,
    }, 
    title: {
        type:String,
        default: ""
    },
    body: {
        type:String,
        default: ""
    },    
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

ActivityLogSchema.set('toObject', { virtuals: true });
ActivityLogSchema.set('toJSON', { virtuals: true });

const ActivityLog = mongoose.model('ActivityLog',ActivityLogSchema,'ActivityLog');

module.exports = ActivityLog;