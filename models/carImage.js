const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const CarImageSchema = new Schema({
    car: {
        type:Schema.ObjectId,
        ref:'Car',
        required:[true,'Car ObjectId field is required'],
    },
    
    user: {
        type:Schema.ObjectId,
        ref:'User',
    },

    file: {
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

CarImageSchema.virtual('file_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/car/'+this.file;
});

CarImageSchema.set('toObject', { virtuals: true });
CarImageSchema.set('toJSON', { virtuals: true });

const CarImage = mongoose.model('CarImage',CarImageSchema,'CarImage');

module.exports = CarImage;