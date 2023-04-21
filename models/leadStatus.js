const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadStatusSchema = new Schema({
    status:[],
    stage: {
        type: String
    },
    remark:{
    	type: String
    },
    color_code:{
    	type: String
    },
    position:{
        type: Number
    }
});

LeadStatusSchema.set('toObject', { virtuals: true });
LeadStatusSchema.set('toJSON', { virtuals: true });

const LeadStatus = mongoose.model('LeadStatus',LeadStatusSchema,'LeadStatus');

module.exports = LeadStatus;