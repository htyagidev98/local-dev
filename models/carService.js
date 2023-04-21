const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarServiceSchema = new Schema({
    automaker: {
        type:Schema.ObjectId,
        ref:'Automaker',
        null: true
    },model: {
        type:Schema.ObjectId,
        ref:'Model',
        null: true
    },
    for:{
    	type: String
    },
    package:{
    	type: String
    },
    service:{
    	type: String
    },
    description:{
    	type: String
    },
    cost:{
    	type: Number
    },
    inclusions:{
    	type: String
    },
    fuel_type:{
    	type: String
    }
});

CarServiceSchema.set('toObject', { virtuals: true });
CarServiceSchema.set('toJSON', { virtuals: true });

const CarService = mongoose.model('CarService',CarServiceSchema,'CarService');

module.exports = CarService;