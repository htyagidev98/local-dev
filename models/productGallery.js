const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const ProductGallerySchema = new Schema({
    product: {
        type:Schema.ObjectId,
    },
    file: {
        type:String,
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

ProductGallerySchema.virtual('file_address').get(function() {  
    if(this.type!="link"){
        var file = this.file;
        file = 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/master/product/500/'+file;
        file = file.replace(/^\s+|\s+$/gm,"");
        return file
    }else{
        return this.file;
    }
});

ProductGallerySchema.set('toObject', { virtuals: true });
ProductGallerySchema.set('toJSON', { virtuals: true });

const ProductGallery = mongoose.model('ProductGallery',ProductGallerySchema,'ProductGallery');

module.exports = ProductGallery;