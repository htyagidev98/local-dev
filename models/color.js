const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ColorSchema = new Schema({
	model: {
        type:Schema.ObjectId,
        ref:'Model',
    },
    value: {
        type:String,
    },
    color_code: {
        type:String,
    },
    selected: {
        type:Boolean,
        default:false,
    },
});

const Color = mongoose.model('Color',ColorSchema,'Color');

module.exports = Color;