const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');


const LeadManagementSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'business ObjectId field is required'],
    },
    user:{
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'User ObjectId field is required'],
    },
    lead:{
        type:String,
    },
    type:{
        type:String,
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    }
});

LeadManagementSchema.set('toObject', { virtuals: true });
LeadManagementSchema.set('toJSON', { virtuals: true });

const LeadManagement = mongoose.model('LeadManagement',LeadManagementSchema,'LeadManagement');
module.exports = LeadManagement;