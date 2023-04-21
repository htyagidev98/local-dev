const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const GallerySchema = new Schema({
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

GallerySchema.virtual('file_address').get(function() {  
    if(this.type!="link"){
        return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/gallery/'+this.file;
    }else{
        return this.file;
    }
});

GallerySchema.set('toObject', { virtuals: true });
GallerySchema.set('toJSON', { virtuals: true });

const Gallery = mongoose.model('Gallery',GallerySchema,'Gallery');

module.exports = Gallery;