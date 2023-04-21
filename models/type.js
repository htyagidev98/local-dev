const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TypeSchema = new Schema({
    business: {
        type:String,
    },
});

const Type = mongoose.model('Type',TypeSchema,'Type');

module.exports = Type;