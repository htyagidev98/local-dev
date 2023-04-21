const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StateSchema = new Schema({
    state: {
        type:String,
    },
});

const State = mongoose.model('State',StateSchema,'State');

module.exports = State;