const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const JobInspectionSchema = new Schema({
    booking: {
        type:Schema.ObjectId,
    },
    index:{
        type:Number,
    },
    file: {
        type:String,
    },
    type: {
        type:String,
    },
    stage: {
        type:String,
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    }
});

JobInspectionSchema.virtual('file_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/inspection/'+this.file;
    
});

JobInspectionSchema.set('toObject', { virtuals: true });
JobInspectionSchema.set('toJSON', { virtuals: true });

const JobInspection = mongoose.model('JobInspection',JobInspectionSchema,'JobInspection');

module.exports = JobInspection;