const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiagnosisSchema = new Schema({
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


DiagnosisSchema.set('toObject', { virtuals: true });
DiagnosisSchema.set('toJSON', { virtuals: true });

const Diagnosis = mongoose.model('Diagnosis', DiagnosisSchema, 'Diagnosis');
module.exports = Diagnosis;