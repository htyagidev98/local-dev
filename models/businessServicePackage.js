const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var _ = require('lodash');

const PackageSchema = new Schema({
    service: {
        type:String,
        enum: ['Basic','Advance','Prime'],
    },

    type: {
        type: String,
        enum: ['Customization','Diagnosis','Washing And Detailings','Collision Repair'],
    },
    
    inclusions:[],
    
    service_charges:{
        type:Number,
        default:0
    },
    
    status: {
        type: Boolean,
        default: false
    },
});



const BusinessServicePackageSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User',
        required:[true,'Business ObjectId field is required'],
        unique:true,
    },

    packages: [PackageSchema],
    
    status: {
        type: Boolean,
        default: false
    },

    created_at: {
        type:Date,
    },
    
    updated_at: {
        type:Date,
    },
});

BusinessServicePackageSchema.set('toObject', { virtuals: true });
BusinessServicePackageSchema.set('toJSON', { virtuals: true });

const BusinessServicePackage = mongoose.model('BusinessServicePackage',BusinessServicePackageSchema,'BusinessServicePackage');

module.exports = BusinessServicePackage;