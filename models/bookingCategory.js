const mongoose = require('mongoose');
const Schema = mongoose.Schema;

config = require('./../config');

const Featureschema = new Schema({
    heading: {
        type: String
    },
    description: {
        type: String
    }
});

const BookingCategorySchema = new Schema({
    tag: {
        type: String,
        default: ""
    },
    data_structure_file: {
        type: String,
        default: ""
    },

    title: {
        type: String,
        default: ""
    },

    icon: {
        type: String,
        default: ""
    },

    image: {
        type: String,
        default: ""
    },

    features: [Featureschema],

    video: {
        type: String,
        default: ""
    },

    home_visibility: {
        type: Boolean,
        default: false
    },

    nested: {
        type: Boolean,
        default: false
    },

    position: {
        type: Number
    }
});


BookingCategorySchema.virtual('image_address').get(function () {
    return 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/icons/' + this.image;
});

BookingCategorySchema.virtual('video_address').get(function () {
    return 'https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + '/icons/' + this.video;
});


BookingCategorySchema.set('toObject', { virtuals: true });
BookingCategorySchema.set('toJSON', { virtuals: true });




const BookingCategory = mongoose.model('BookingCategory', BookingCategorySchema, 'BookingCategory');

module.exports = BookingCategory;
