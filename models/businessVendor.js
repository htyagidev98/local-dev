const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var config = require('./../config');

const BusinessVendorSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business field is required'],
    },
    vendor: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business field is required'],
    },
    supplier:{
        type:String,
    },  
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

BusinessVendorSchema.virtual('file_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/Vendor/'+this.file;
});

BusinessVendorSchema.set('toObject', { virtuals: true });
BusinessVendorSchema.set('toJSON', { virtuals: true });

const BusinessVendor = mongoose.model('BusinessVendor',BusinessVendorSchema,'BusinessVendor');

module.exports = BusinessVendor;