const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const AssetSchema = new Schema({
    value: {
        type: String
    }    
});


AssetSchema.set('toObject', { virtuals: true });
AssetSchema.set('toJSON', { virtuals: true });

const Asset = mongoose.model('Asset',AssetSchema,'Asset');

module.exports = Asset;