const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var config = require('./../config');

const BusinessGallerySchema = new Schema({
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

BusinessGallerySchema.virtual('file_address').get(function () {
    return 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/gallery/' + this.file;
});

BusinessGallerySchema.set('toObject', { virtuals: true });
BusinessGallerySchema.set('toJSON', { virtuals: true });

const BusinessGallery = mongoose.model('BusinessGallery', BusinessGallerySchema, 'BusinessGallery');

module.exports = BusinessGallery;