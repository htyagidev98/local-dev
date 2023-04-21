const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PackageUsedSchema = new Schema({
    user:{
        type:Schema.ObjectId,
        ref:'User',
    },
    booking:{
        type:Schema.ObjectId,
        ref:'Booking',
    },
    car:{
        type:Schema.ObjectId,
        ref:'Car',
        null: true
    },
    package:{
        type:Schema.ObjectId,
        ref:'UserPackage',
        null: true
    },
    for:{
        type: String
    },
    label:{
        type: String
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

PackageUsedSchema.set('toObject', { virtuals: true });
PackageUsedSchema.set('toJSON', { virtuals: true });

const PackageUsed = mongoose.model('PackageUsed',PackageUsedSchema,'PackageUsed');

module.exports = PackageUsed;