const mongoose = require('mongoose');
const Schema = mongoose.Schema;


config = require('./../config')

const AppVersionSchema = new Schema({
    version: {
        type:String,
    },
    app: {
        type:String,
    },    
    device_type: {
        type:String,
    },
    type: {
        type:String,
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

AppVersionSchema.set('toObject', { virtuals: true });
AppVersionSchema.set('toJSON', { virtuals: true });

const AppVersion = mongoose.model('AppVersion', AppVersionSchema, 'AppVersion');
module.exports = AppVersion;
