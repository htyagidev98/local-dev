const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StateSchema = new Schema({
    total: String,
    business: {type: Schema.ObjectId,
                ref: "User"},
    user: {type: Schema.ObjectId,
            ref: "User"},
    services: [],
});

const State = mongoose.model('ServicesCart',StateSchema,'ServiceCart');

module.exports = State;