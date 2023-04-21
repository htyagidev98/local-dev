const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');




const BikeSchema = new Schema({
    model: {
        type:Schema.ObjectId,
    },
    
    data: {}
    
});


BikeSchema.set('toObject', { virtuals: true });
BikeSchema.set('toJSON', { virtuals: true });

const Bike = mongoose.model('Bike',BikeSchema,'Bike');

module.exports = Bike;