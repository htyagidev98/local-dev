const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoggedInAccountsSchema = new Schema({
    business: {
        type:Schema.ObjectId,
        ref:'User'
    },
    device_id: {
        type:String,
    },
    status: {
        type: Number,
    },
    created_at: {
        type:Date,
    },
    updated_at: {
        type:Date,
    },
});

const LoggedInAccount = mongoose.model('LoggedInAccount',LoggedInAccountsSchema,'LoggedInAccount');

module.exports = LoggedInAccount;