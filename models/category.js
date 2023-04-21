const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    category: {
        type:String,
    },
    is_company: {
        type:Boolean,
        default:true
    },
});

CategorySchema.set('toObject', { virtuals: true });
CategorySchema.set('toJSON', { virtuals: true });

const Category = mongoose.model('Category',CategorySchema,'Category');

module.exports = Category;