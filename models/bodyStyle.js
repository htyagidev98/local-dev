const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BodyStyleSchema = new Schema({
    value: {
        type:String,
    },
    selected: {
        type:Boolean,
        default:false,
    },
});

BodyStyleSchema.set('toObject', { virtuals: true });
BodyStyleSchema.set('toJSON', { virtuals: true });


const BodyStyle = mongoose.model('BodyStyle', BodyStyleSchema, 'BodyStyle');

module.exports = BodyStyle;