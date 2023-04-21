const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AutomakerSchema = new Schema({
    maker: {
        type:String,
    },
    logo: {
        type:String,
    },
    type: {
        type:String,
    },
});

AutomakerSchema.virtual('value').get(function() {  
    return this.maker;
});

AutomakerSchema.set('toObject', { virtuals: true });
AutomakerSchema.set('toJSON', { virtuals: true });

const Automaker = mongoose.model('Automaker', AutomakerSchema, 'Automaker');
module.exports = Automaker;