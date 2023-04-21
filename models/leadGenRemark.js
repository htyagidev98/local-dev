const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadGenRemarkSchema = new Schema({
    lead:{
        type:Schema.ObjectId,
        ref:'Lead',
        default: null,
    },
    assignee:{
        type:Schema.ObjectId,
        ref:'User',
        default: null,
    },
    customer_remark:{
        type: String,
        default: ""
    },
    assignee_remark:{
    	type: String,
        default: ""
    },
    resource:{
        type: String,
        default: ""
    },
    type:{
        type: String,
        default: ""
    },
    source:{
        type: String,
        default: ""
    },
    status:{
    	type: String
    },
    reason:{
        type: String,
        default: ""
    },
    color_code:{
        type: String
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    }
});

LeadGenRemarkSchema.set('toObject', { virtuals: true });
LeadGenRemarkSchema.set('toJSON', { virtuals: true });

const LeadGenRemark = mongoose.model('LeadGenRemark',LeadGenRemarkSchema,'LeadGenRemark');

module.exports = LeadGenRemark;