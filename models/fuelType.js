const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FuelTypeSchema = new Schema({
    value: {
        type:String,
    },
});

const FuelType = mongoose.model('FuelType',FuelTypeSchema,'FuelType');

module.exports = FuelType;