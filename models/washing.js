const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WashingSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
        null: true
    },
    automaker: {
        type:Schema.ObjectId,
        ref:'Automaker'
    },
    model: {
        type:Schema.ObjectId,
        ref:'Model',
        null: true
    },
    maker:{
        type: String
    },
    for:{
        type: String
    },
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
    },
    unit:{
        type: String,
        default: ""
    }
});


WashingSchema.set('toObject', { virtuals: true });
WashingSchema.set('toJSON', { virtuals: true });

const Washing = mongoose.model('Washing', WashingSchema, 'Washing');
module.exports = Washing;