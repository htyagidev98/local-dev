const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const activity = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        // required: [true, 'Business ObjectId field is required'],
    },
    time: {
        type: String
    },
    activity: {
        type: String
    },
    remark: {
        type: String
    },
    status: {
        type: String
    },
    created_at: {
        type: Date
    }
})

const stockLogs = new Schema({
    business: Schema.ObjectId,
    vendor: Schema.ObjectId,
    reference_no: String,
    logs: [
        activity
    ],
    address: String,
    created_at: Date,
    updated_at: Date
})


stockLogs.set('toObject', { virtuals: true });
stockLogs.set('toJSON', { virtuals: true });

const logs = mongoose.model('stockLogs', stockLogs, 'stockLogs');
module.exports = logs;