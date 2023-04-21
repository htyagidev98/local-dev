const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const ProductImageSchema = new Schema({
    source: {
        type:Schema.ObjectId,
    },
    file: {
        type:String,
        required:[true,'Image is required']
    },
    type: {
        type:String,
    },
    category: {
        type:String,
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    }
});

ProductImageSchema.virtual('file_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/product/'+this.file;
});

ProductImageSchema.set('toObject', { virtuals: true });
ProductImageSchema.set('toJSON', { virtuals: true });

const ProductImage = mongoose.model('ProductImage',ProductImageSchema,'ProductImage');

module.exports = ProductImage;