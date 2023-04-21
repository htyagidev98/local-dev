const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadFollowUpSchema = new Schema({
    lead:{
        type:Schema.ObjectId,
        ref:'Lead',
    },
    assignee:{
        type:Schema.ObjectId,
        ref:'user',
        null: true
    },
    date:{
        type:Date,
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    }
});

LeadFollowUpSchema.set('toObject', { virtuals: true });
LeadFollowUpSchema.set('toJSON', { virtuals: true });

const LeadFollowUp = mongoose.model('LeadFollowUp',LeadFollowUpSchema,'LeadFollowUp');

module.exports = LeadFollowUp;