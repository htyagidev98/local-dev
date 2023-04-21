 const mongoose = require('mongoose'),
        moment = require('moment-timezone');
const Schema = mongoose.Schema;
var _ = require('lodash');

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

const PostSchema = new Schema({
    user: {
        type:Schema.ObjectId,
        ref:'User',
    },
    
    car: {
        type:String,
    },

    model:{
        type:Schema.ObjectId,
        ref:'Model',
        default: null
    },
    
    pId: {
        type:String,//Request
    },
    
    post: {
        type:String,//Request
    },
    
    link: {
        type:String,//Request
    },
    
    state: {
        type:String,//Request
    },
    
    start: {
        type:Date,//Request
    },
    
    end: {
        type:Date,//Request
    },
    
    mentions: {
        type: [MentionSchema]
    },

    is_primary: {
        type:Boolean,
        default:true
    },

    club: {
        type:Schema.ObjectId,
        ref:'Club',
        default: null
    },
    
    type: {
        type:String,//Request
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


PostSchema.virtual('posted_on').get(function() {  
    var tz = moment.tz.guess();
    return moment.tz(this.created_at, tz).format('MMMM D YYYY, h:mm a');
});

PostSchema.virtual('posted_ago').get(function() {  
    var tz = moment.tz.guess();
    return moment(this.created_at,tz).fromNow();
});

PostSchema.virtual('thumbnails', {
    ref: 'PostMedia',
    localField: '_id',
    foreignField: 'post',
});


PostSchema.virtual('likes', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'post',
});

PostSchema.virtual('hashtags', {
    ref: 'Hashtag',
    localField: '_id',
    foreignField: 'post',
});

PostSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post',
});

PostSchema.virtual('liked').get(function() {
    var likes = this.likes;
    var status = _.filter(likes, {user:mongoose.mongo.ObjectId(loggedInUser)}).length > 0 ? true:false;
    return status;
});

PostSchema.virtual('is_author').get(function() {
    var user = this.user;
    var status = (user.id == mongoose.mongo.ObjectId(loggedInUser)) ? true:false;
    return status;
});


PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });

MentionSchema.set('toObject', { virtuals: true });
MentionSchema.set('toJSON', { virtuals: true });

const Post = mongoose.model('Post',PostSchema,'Post');

module.exports = Post;