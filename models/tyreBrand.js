const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TyreBrandSchema = new Schema({
    value: {
        type:String,
    },
});

TyreBrandSchema.set('toObject', { virtuals: true });
TyreBrandSchema.set('toJSON', { virtuals: true });


const TyreBrand = mongoose.model('TyreBrand', TyreBrandSchema, 'TyreBrand');

module.exports = TyreBrand;