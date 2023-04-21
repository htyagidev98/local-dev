const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    zip: {
        type:String,
    },

    city: {
        type:String,
    },

    region: {
        type:String,
    },

    latitude: {
        type:Number,
    },

    longitude: {
        type:Number,
    },

    state: {
        type:String,
    },

    country: {
        type:String,
    }
});

LocationSchema.set('toObject', { virtuals: true });
LocationSchema.set('toJSON', { virtuals: true });


const Location = mongoose.model('Location',LocationSchema,'Location');

module.exports = Location;
