const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');
var config = require('./../config');

const ModelMediaSchema = new Schema({
    model: {
        type:Schema.ObjectId,
        ref:'Model',
        required:[true,'Model ObjectId field is required'],
    },
    file: {
        type:String,
        required:[true,'Image is required']
    },
    type: {
        type:String,
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

ModelMediaSchema.virtual('file_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/model/'+this.file;
});

const ModelMedia = mongoose.model('ModelMedia',ModelMediaSchema,'ModelMedia');

module.exports = ModelMedia;