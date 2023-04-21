const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransmissionSchema = new Schema({
    value: {
        type:String,
    },
    selected: {
        type:Boolean,
        default:false,
    },
});

TransmissionSchema.set('toObject', { virtuals: true });
TransmissionSchema.set('toJSON', { virtuals: true });


const Transmission = mongoose.model('Transmission', TransmissionSchema, 'Transmission');

module.exports = Transmission;