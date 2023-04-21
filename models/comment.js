const mongoose = require('mongoose'),
      moment = require('moment-timezone');
const Schema = mongoose.Schema;

var tz = moment.tz.guess();

const MentionSchema = new Schema({
    _id: {
        type:Schema.ObjectId,
        ref:'User',
    },
    username: {
        type: String,
    }, 
    type: {
        type: String,
    }
});

const CommentSchema = new Schema({
    post: {
        type:Schema.ObjectId,
        ref:'Comment',
        null: true
    },
    
    user: {
        type:Schema.ObjectId,
        ref:'User',
        null: true
    },
    
    comment: {
        type:String,
    },
    
    mentions: {
        type: [MentionSchema]
    },

    status: {
        type:Boolean,
        default:true
    },

    created_at: {
        type:Date,
    },
    
    updated_at: {
        type:Date,
    },
});


CommentSchema.virtual('posted_on').get(function() {  
    var tz = moment.tz.guess();
    return moment.tz(this.created_at,tz).format('MMMM D YYYY, h:mm a');
});

CommentSchema.virtual('posted_ago').get(function() {  
    var tz = moment.tz.guess();
    return moment(this.created_at,tz).fromNow();
});

CommentSchema.set('toObject', { virtuals: true });
CommentSchema.set('toJSON', { virtuals: true });

MentionSchema.set('toObject', { virtuals: true });
MentionSchema.set('toJSON', { virtuals: true });

const Comment = mongoose.model('Comment',CommentSchema,'Comment');

module.exports = Comment;