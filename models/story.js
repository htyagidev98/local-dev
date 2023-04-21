const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

const StorySchema = new Schema({
    title: {
        type:String,
    }, 
    post: {
        type:String,
    }, 
    media: {
        type:String,
    }, 
    media_type: {
        type:String,
    },
    source: {
        type:String,
    },
    source_url: {
        type:String,
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

const Story = mongoose.model('Story',StorySchema,'Story');

module.exports = Story;