const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QualityCheckSchema = new Schema({
    category:{
        type: String
    },
    position:{
    	type: Number,
    },
    point:{
        type: String
    }
});


QualityCheckSchema.set('toObject', { virtuals: true });
QualityCheckSchema.set('toJSON', { virtuals: true });

const QualityCheck = mongoose.model('QualityCheck', QualityCheckSchema, 'QualityCheck');
module.exports = QualityCheck;