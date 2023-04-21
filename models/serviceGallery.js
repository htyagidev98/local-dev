const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var config = require('./../config');

const ServiceGallerySchema = new Schema({
    business: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'Business field is required'],
    },
    file: {
        type: String,
        required: [true, 'Image is required']
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    category: {
        type: String,
        default: ""
    },

});

ServiceGallerySchema.virtual('file_address').get(function () {
    return 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/gallery/' + this.file;
});

ServiceGallerySchema.set('toObject', { virtuals: true });
ServiceGallerySchema.set('toJSON', { virtuals: true });

const ServiceGallery = mongoose.model('ServiceGallery', ServiceGallerySchema, 'ServiceGallery');

module.exports = ServiceGallery;