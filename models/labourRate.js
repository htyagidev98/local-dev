const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const LabourRateSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
        null: true
    },
    segment:{
        type: String,
    },
    rate:{
        type: Number,
        default: false
    }
});

LabourRateSchema.set('toObject', { virtuals: true });
LabourRateSchema.set('toJSON', { virtuals: true });

const LabourRate = mongoose.model('LabourRate',LabourRateSchema,'LabourRate');

module.exports = LabourRate;