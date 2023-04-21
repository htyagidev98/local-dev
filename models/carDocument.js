const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const CarDocumentSchema = new Schema({
    car: {
        type:Schema.ObjectId,
        ref:'Car',
        required:[true,'Car ObjectId field is required'],
    },
    
    user: {
        type:Schema.ObjectId,
        ref:'User',
        default: null
    },

    file: {
        type: String
    },
    
    file_type: {
        type: String
    },

    caption: {
        type: String
    },

    feature: {
        type: Boolean,
        default: false
    },

    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

CarDocumentSchema.virtual('file_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/car/'+this.file;
});

CarDocumentSchema.set('toObject', { virtuals: true });
CarDocumentSchema.set('toJSON', { virtuals: true });

const CarDocument = mongoose.model('CarDocument',CarDocumentSchema,'CarDocument');

module.exports = CarDocument;