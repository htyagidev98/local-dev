const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpenseCategorySchema = new Schema({
    category: {
        type:String,
    }
});

ExpenseCategorySchema.set('toObject', { virtuals: true });
ExpenseCategorySchema.set('toJSON', { virtuals: true });

const ExpenseCategory = mongoose.model('ExpenseCategory',ExpenseCategorySchema,'ExpenseCategory');

module.exports = ExpenseCategory;