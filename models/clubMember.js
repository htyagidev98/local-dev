const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClubMemberSchema = new Schema({
    club: {
        type:Schema.ObjectId,
        ref:'Club',
        null: true
    },
    user: {
        type:Schema.ObjectId,
        ref:'User',
        null: true
    },
    model: {
        type:Schema.ObjectId,
        ref:'Model',
        null: true
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    }
});


ClubMemberSchema.set('toObject', { virtuals: true });
ClubMemberSchema.set('toJSON', { virtuals: true });


const ClubMember = mongoose.model('ClubMember',ClubMemberSchema,'ClubMember');

module.exports = ClubMember;