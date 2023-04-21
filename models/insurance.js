const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InsuranceSchema = new Schema({
    service:{
    	type: String
    },
    description:{
    	type: String
    },
    labour_cost: {
        type:Number
    },
    part_cost: {
        type:Number
    },
    mrp:{
        type: Number
    },
    cost:{
    	type: Number
    },
    doorstep:{
        type: Boolean,
        default: false
    }
});


InsuranceSchema.set('toObject', { virtuals: true });
InsuranceSchema.set('toJSON', { virtuals: true });

const Insurance = mongoose.model('Insurance', InsuranceSchema, 'Insurance');
module.exports = Insurance;