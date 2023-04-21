const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PointSchema = new Schema({
    user: {
        type:Schema.ObjectId,
        ref:'User',
        null: true
    },
    activity: {
        type:String,
    },
    tag: {
        type:String,
    },
    source: {
        type:Schema.ObjectId
    },
    type: {
        type:String,
    },
    points: {
        type:Number,
    },
    status: {
        type: Boolean,
        default: true
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

PointSchema.set('toObject', { virtuals: true });
PointSchema.set('toJSON', { virtuals: true });

const Point = mongoose.model('Point',PointSchema,'Point');

module.exports = Point;