const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductKeywordSchema = new Schema({
    keyword: {
        type:String,
        text: true
    },
    suggestion: {
        type:String
    },
    html_suggestion: {
        type:String
    },
    property: [],
    type: {
        type:String,
    }
});

ProductKeywordSchema.set('toObject', { virtuals: true });
ProductKeywordSchema.set('toJSON', { virtuals: true });

const ProductKeyword = mongoose.model('ProductKeyword',ProductKeywordSchema,'ProductKeyword');

module.exports = ProductKeyword;
