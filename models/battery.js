const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

const BatterySchema = new Schema({
    model: {
        type:Schema.ObjectId,
        ref:'Model',
        required:[true,'Model ObjectId field is required'],
    },
    fuel_type: {
        type:String,
    },
    capacity: {
        type:String,
    },
    orientation: {
        type:String,
    }
});


const Battery = mongoose.model('Battery',BatterySchema,'Battery');

module.exports = Battery;