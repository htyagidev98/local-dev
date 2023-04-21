const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BatteryBrandSchema = new Schema({
    value: {
        type:String,
    },
});

BatteryBrandSchema.set('toObject', { virtuals: true });
BatteryBrandSchema.set('toJSON', { virtuals: true });


const BatteryBrand = mongoose.model('BatteryBrand', BatteryBrandSchema, 'BatteryBrand');

module.exports = BatteryBrand;