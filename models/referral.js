const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReferralSchema = new Schema({
	code: {
        type:String,
    },
    owner: {
        type:Schema.ObjectId,
        ref:'User',
    },
    user: {
        type:Schema.ObjectId,
        ref:'User',
    },
    created_at:{
        type:Date,
    },
    updated_at:{
        type:Date,
    },
});

const Referral = mongoose.model('Referral',ReferralSchema,'Referral');

module.exports = Referral;