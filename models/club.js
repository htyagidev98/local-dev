const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClubSchema = new Schema({
    model: {
        type:Schema.ObjectId,
        ref:'Model',
        null: true
    },
    name:{
    	type: String,
    }
});

ClubSchema.set('toObject', { virtuals: true });
ClubSchema.set('toJSON', { virtuals: true });

const Club = mongoose.model('Club',ClubSchema,'Club');

module.exports = Club;