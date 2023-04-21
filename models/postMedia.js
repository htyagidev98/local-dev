const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const PostMediaSchema = new Schema({
    post: {
        type:Schema.ObjectId,
        ref:'Post',
        null: true
    },
    user: {
        type:Schema.ObjectId,
        ref:'User',
        null: true
    },
    preview: {
        type:String,
    },
    file: {
        type:String,
    },
    caption: {
        type:String,
    },
    place: {
        type:String,
    },
    day: {
        type:String,
    },
    type: {
        type:String,
    },
    status: {
        type:Boolean,
        default:true
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    }
});

PostMediaSchema.virtual('file_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/post/'+this.file;
});

PostMediaSchema.virtual('preview_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/post/'+this.preview;
});

PostMediaSchema.set('toObject', { virtuals: true });
PostMediaSchema.set('toJSON', { virtuals: true });



const PostMedia = mongoose.model('PostMedia',PostMediaSchema,'PostMedia');

module.exports = PostMedia;