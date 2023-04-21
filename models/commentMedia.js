const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const CommentMediaSchema = new Schema({
    comment: {
        type:Schema.ObjectId,
        ref:'Comment',
        null: true
    },
    file: {
        type:String,
    },
});

CommentMediaSchema.virtual('file_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/post/'+this.file;
});

CommentMediaSchema.set('toObject', { virtuals: true });
CommentMediaSchema.set('toJSON', { virtuals: true });



const CommentMedia = mongoose.model('CommentMedia',CommentMediaSchema,'CommentMedia');

module.exports = CommentMedia;