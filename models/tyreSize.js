const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TyreSizeSchema = new Schema({
    value: {
        type:String,
    },
});

TyreSizeSchema.set('toObject', { virtuals: true });
TyreSizeSchema.set('toJSON', { virtuals: true });


const TyreSize = mongoose.model('TyreSize', TyreSizeSchema, 'TyreSize');

module.exports = TyreSize;