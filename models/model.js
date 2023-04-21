const mongoose = require('mongoose'),
    _ = require('lodash');

const Schema = mongoose.Schema;


const PriceSchema = new Schema({
    min: {
        type:Number,
    },
    max:{
        type:Number,
    }
});

const ModelSchema = new Schema({
    automaker: {
        type:Schema.ObjectId,
        ref:'Automaker',
    },
    
    model: {
        type:String,
    },
    
    value: {
        type:String,
    },

    price:PriceSchema,

    feature_image:{
        type:String,
        default:"default.png"
    },
    
    segment: {
        type:String,
        default:""
    },

    verdict: {
        type:String,
        default:""
    },
    
    careager_rating: {
        type:Number,
        default:0
    },

    media_rating: {
        type:Number,
        default:0
    },

    type: {
        type:String,
    },

    slug: {
        type:String,
    },
    
});


ModelSchema.set('toObject', { virtuals: true });
ModelSchema.set('toJSON', { virtuals: true });


ModelSchema.virtual('rating', {
    ref: 'ModelReview',
    localField: '_id',
    foreignField: 'model'
});


ModelSchema.virtual('bookmark', {
    ref: 'BookmarkModel',
    localField: '_id',
    foreignField: 'model'
});

ModelSchema.virtual('is_bookmarked').get(function() {
    var bookmark = this.bookmark;
    console.log(bookmark)
    var status = _.filter(bookmark, {user:mongoose.mongo.ObjectId(loggedInUser)}).length > 0 ? true:false;
    return status;
});

ModelSchema.virtual('user_rating').get(function() {
    var rating = this.rating;
    var average = _.meanBy(rating, (r) => r.rating);
    console.log(average)
    if(!average)
    {
       return average = 0;
    }

    return average;
});




const Model = mongoose.model('Model', ModelSchema, 'Model');

module.exports = Model;