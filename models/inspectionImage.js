const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var config = require('./../config');

const InspectionImageSchema = new Schema({
    booking: {
        type:Schema.ObjectId,
    },
    file: {
        type:String,
    },
    type: {
        type:String,
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    }
});

InspectionImageSchema.virtual('file_address').get(function() {  
    return 'https://s3.ap-south-1.amazonaws.com/'+config.BUCKET_NAME+'/inspection/'+this.file;
    
});

InspectionImageSchema.set('toObject', { virtuals: true });
InspectionImageSchema.set('toJSON', { virtuals: true });

const InspectionImage = mongoose.model('InspectionImage',InspectionImageSchema,'InspectionImage');

module.exports = InspectionImage;